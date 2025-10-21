import bodyParser from "body-parser";
import express from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { Ollama } from "ollama";
import cors from "cors";

const ollama = new Ollama({ host: " http://localhost:11434" });

const memoCache = new Map<string, string>();

const app = express();
app.use(cors());
app.use(bodyParser.json());

async function openDB() {
  return open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
}

async function translateToSQLLLM(question: string): Promise<string> {
  if (memoCache.has(question)) {
    return memoCache.get(question)!;
  }

  const prompt = `
    You are an expert SQL query generator. Your task is to take a natural language question from the user and convert it into a valid SQL query that can be executed on a given database table. You must base the query strictly on the provided table schema.

### Instructions:
- The table schema will be provided in the following format:  
  Table name: [table_name]  
  Columns: [column1 (type)], [column2 (type)], ...  
  (Example: Table name: employees  
  Columns: id (integer), name (varchar), salary (decimal), hire_date (date))
- Only generate the SQL query. Do not include explanations, additional text, or comments.
- Ensure the query is syntactically correct and uses standard SQL.
- Handle aggregations (e.g., COUNT, SUM), filters (e.g., WHERE), sorting (e.g., ORDER BY), and joins only if explicitly needed based on the schema and question. If the question implies multiple tables but only one is given, stick to the given table.
- If the question is ambiguous or cannot be translated based on the schema, output: "Invalid question for the given table."
- Output the query in a code block for easy copying.

User question: ${question}  
Table schema: users (id INTEGER, name TEXT, email TEXT, created_at DATETIME)  

Generated SQL query output (only the SQL code block):
  `;

  const response = await ollama.chat({
    model: "gemma3:4b",
    messages: [{ role: "user", content: prompt }],
  });

  const sqlContent = response.message.content.trim();
  const codeBlockMatch = sqlContent.match(/```sql\s*([\s\S]*?)\s*```/i);

  if (codeBlockMatch && codeBlockMatch[1]) {
    const sql = codeBlockMatch[1].trim();

    memoCache.set(question, sql);

    return sql;
  }

  memoCache.set(question, sqlContent);

  return sqlContent;
}

app.post("/mcp", async (req, res) => {
  const { method, params } = req.body;

  try {
    const db = await openDB();

    if (method === "ping") {
      return res.json({ result: "pong" });
    }

    if (method === "query") {
      const rows = await db.all(params.sql);
      return res.json({ result: rows });
    }

    if (method === "exec") {
      await db.run(params.sql);
      return res.json({ result: "ok" });
    }

    if (method === "ask") {
      const question = params.question;
      const sql = await translateToSQLLLM(question);

      console.log("Generated SQL:", sql);

      const rows = await db.all(sql);
      return res.json({ sql, result: rows });
    }

    res.status(400).json({ error: `Unknown method: ${method}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ MCP server running on http://localhost:${PORT}`);
});
