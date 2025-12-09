import { Ollama } from "ollama";
import { Database } from "sqlite";
import { schemaCache } from "../db/schema-cache.ts";

const ollama = new Ollama({ host: " http://localhost:11434" });

const generateChatAnswer = async (prompt: string) => {
  const response = await ollama.chat({
    model: "qwen2.5:latest",
    messages: [{ role: "user", content: prompt }],
  });

  return response.message.content.trim();
};

export async function questionToSQL(
  question: string,
  db: Database,
): Promise<string> {
  const schemaInfo = await schemaCache.getSchema(db);

  const prompt = `
  You are an expert SQL query generator for SQLite databases. Your task is to convert a natural language question into a valid SQL query based on the provided database schema.

  ${schemaInfo}

  ### Instructions:
  - Use ONLY the tables and columns defined in the schema above
  - Generate syntactically correct SQLite queries
  - Use appropriate JOIN types (INNER, LEFT, RIGHT) based on the question context
  - Include WHERE clauses for filtering when needed
  - Use aggregation functions (COUNT, SUM, AVG, MIN, MAX) when appropriate
  - Add ORDER BY clauses for sorting when requested
  - Use GROUP BY for aggregations
  - Ensure proper handling of NULL values
  - Generate ONLY the SQL query without explanations, comments, or markdown formatting
  - If the question cannot be answered with the available schema, output: "Cannot generate query: required tables or columns not found in schema"

  ### Examples of good queries:
  - Use table and column names exactly as shown in the schema
  - Use proper SQLite syntax and functions
  - Join tables using their foreign key relationships when needed

  User question: ${question}

  Generated SQL query (output ONLY the raw SQL query):
  `;

  const sqlContent = await generateChatAnswer(prompt);

  const codeBlockMatch = sqlContent
    .trim()
    .split("```sql\n")
    .join("")
    .split("\n```")
    .join("");

  return codeBlockMatch;
}
