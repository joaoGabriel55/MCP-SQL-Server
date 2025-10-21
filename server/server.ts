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
    You are an expert SQL query generator. Your task is to take a natural language question from the user and convert it into a valid SQL query that can be executed on a database table. You must infer the table and its schema dynamically based on the context of the question, without relying on a static or predefined table schema.

    ### Instructions:
    - Identify the most relevant table and its likely columns based on the natural language question. Assume standard naming conventions for tables and columns (e.g., "users" for user-related data, "id" for primary keys, "name" for text fields, etc.) if not explicitly provided.
    - If the question references a specific table name, prioritize it. Otherwise, infer the table name from context (e.g., "employees" for questions about staff, "orders" for purchase-related queries).
    - Assume reasonable column names and data types based on the question's context (e.g., "salary" as DECIMAL for employee pay, "created_at" as DATETIME for timestamps).
    - Generate only the SQL query. Do not include explanations, additional text, or comments.
    - Ensure the query is syntactically correct and uses standard SQL.
    - Handle aggregations (e.g., COUNT, SUM), filters (e.g., WHERE), sorting (e.g., ORDER BY), and joins only if explicitly needed based on the inferred schema and question. If the question implies multiple tables but only one can be reasonably inferred, stick to that table.
    - If the question is too ambiguous or cannot be translated into a valid query based on reasonable assumptions, output: "Invalid question for the inferred table."
    - Output the query in a code block for easy copying.

    User question: ${question}

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
