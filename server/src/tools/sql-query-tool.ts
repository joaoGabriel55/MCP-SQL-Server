import { Database } from "sqlite";

export const sqlQueryTool = {
  type: "function",
  function: {
    name: "sql_query_tool",
    description: "Receive a sql query and return the result",
    parameters: {
      type: "object",
      required: ["sql"],
      properties: {
        sql: { type: "string", description: "The SQL query to execute" },
      },
    },
  },
};

export const runSQLQuery = async ({ sql, db }: { sql: string; db: Database }) => {
  try {
    const rows = await db.all(sql);

    const output = { sql, result: rows };

    return output;
  } catch (error) {
    throw new Error(`Error executing SQL query: ${(error as Error).message}`);
  }
};
