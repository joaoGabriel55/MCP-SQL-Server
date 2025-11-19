import { Ollama } from "ollama";

const ollama = new Ollama({ host: " http://localhost:11434" });

const generateChatAnswer = async (prompt: string) => {
  const response = await ollama.chat({
    model: "qwen2.5:latest",
    messages: [{ role: "user", content: prompt }],
  });

  return response.message.content.trim();
};

export async function questionToSQL(question: string): Promise<string> {
  const prompt = `
    You are an expert SQL query generator. Your task is to take a natural language question from the user and convert it into a valid SQL query that can be executed on one or more database tables.
    You must infer the tables, their schemas, and appropriate join types (LEFT, RIGHT, INNER, OUTER) dynamically based on the context of the question, without relying on a static or predefined table schema.

    ### Instructions:
    - Identify the most relevant table(s) and their likely columns based on the natural language question. Assume standard naming conventions for tables and columns (e.g., "users" for user-related data, "id" for primary keys, "name" for text fields, etc.) if not explicitly provided.
    - If the question references specific table names, prioritize them. Otherwise, infer table names from context (e.g., "employees" for staff-related queries, "orders" for purchase-related queries, "departments" for organizational data).
    - Assume reasonable column names and data types based on the question's context (e.g., "salary" as DECIMAL for employee pay, "created_at" as DATETIME for timestamps, "user_id" as INTEGER for foreign keys).
    - Detect when multiple tables are implied and infer appropriate join types (LEFT, RIGHT, INNER, OUTER) based on the relationships described in the question. Use foreign keys (e.g., "user_id", "order_id") to establish relationships between tables when needed.
    - Generate only the SQL query. Do not include explanations, additional text, or comments.
    - Ensure the query is syntactically correct and uses standard SQL.
    - Handle aggregations (e.g., COUNT, SUM), filters (e.g., WHERE), sorting (e.g., ORDER BY), and joins (LEFT, RIGHT, INNER, OUTER) only if explicitly or implicitly needed based on the inferred schema and question.
    - If the question is too ambiguous or cannot be translated into a valid query based on reasonable assumptions, output: "Invalid question for the inferred table(s)."
    - Output the query in a code block for easy copying.

    User question: ${question}

    Generated SQL query output (only the SQL raw query without break lines):
  `;

  const sqlContent = await generateChatAnswer(prompt);

  const codeBlockMatch = sqlContent.trim().split("```sql\n").join("").split("\n```").join("");

  return codeBlockMatch;
}
