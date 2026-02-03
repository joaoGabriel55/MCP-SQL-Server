import type { Message } from "ollama";
import { Ollama } from "ollama";
import { openDB } from "../db/open-db.ts";
import { schemaCache } from "../db/schema-cache.ts";
import { tools } from "../tools/index.ts";
import { runSQLQuery } from "../tools/sql-query-tool.ts";

const ollama = new Ollama({ host: " http://localhost:11434" });

const generateChatAnswer = async (messages: Message[]) => {
  const response = await ollama.chat({
    model: "qwen2.5:latest",
    messages,
    tools,
    // think: true,
  });

  return response.message;
};

const memoCache = new Map<string, string>();

export async function questionToSQLResult(question: string) {
  const db = await openDB();

  try {
    if (memoCache.has(question)) {
      const sql = memoCache.get(question)!;

      const result = await runSQLQuery({ sql, db });

      return result;
    }

    const schemaInfo = await schemaCache.getSchema(db);

    const prompt = `
      You are an expert SQL query generator for SQLite databases.

      Your task is to transform a natural language question into a valid SQLite SQL query **by ALWAYS invoking the MCP tool 'sql_query_tool'**.
      You must NEVER return SQL directly in plain text.

      ### Database schema
      ${schemaInfo}

      ### Mandatory rules
      - You MUST call the MCP tool 'sql_query_tool' to produce the final output
      - Do NOT output SQL directly in the assistant message
      - The SQL query must be the ONLY content passed to the tool
      - If a query cannot be generated, pass the exact string below to the tool:
        "Cannot generate query: required tables or columns not found in schema"

      ### Query generation rules
      - Use ONLY tables and columns defined in the schema
      - Use table and column names exactly as they appear in the schema
      - Generate syntactically correct SQLite SQL
      - Use appropriate JOINs (INNER, LEFT, RIGHT) based on relationships and intent
      - Apply WHERE clauses when filtering is implied
      - Use aggregation functions (COUNT, SUM, AVG, MIN, MAX) when appropriate
      - Use GROUP BY whenever aggregations are used
      - Use ORDER BY when sorting is requested
      - Handle NULL values correctly when relevant
      - Do NOT include comments, explanations, markdown, or formatting

      ### User question
      ${question}

      ### Output requirement
      - Call the MCP tool 'sql_query_tool'
      - Pass ONLY the raw SQL query (or the failure message) as the tool input
    `;

    const messages: Message[] = [{ role: "user", content: prompt }];

    const response = await generateChatAnswer(messages);

    messages.push(response);

    console.log(response.tool_calls);

    if (!response.tool_calls?.length) return null;

    const call = response.tool_calls[0];
    const args = call.function.arguments as { sql: string };

    console.log(args.sql);

    const result = await runSQLQuery({ sql: args.sql, db });

    memoCache.set(question, args.sql);

    return result;
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    await db.close();
  }
}
