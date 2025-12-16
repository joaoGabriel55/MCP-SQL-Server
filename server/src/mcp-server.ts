import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { openDB } from "./db/open-db";
import { questionToSQL } from "./services/question-to-sql";

const memoCache = new Map<string, string>();

const mcpServer = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

mcpServer.registerTool(
  "sql-query-tool",
  {
    title: "SQL Query Tool",
    description:
      "Ask a question in natural language receives the SQL query and the result",
    inputSchema: { question: z.string() },
    outputSchema: { sql: z.string(), result: z.array(z.any()) },
  },
  async ({ question }) => {
    const db = await openDB();
    let output: { sql: string; result: any[] };

    try {
      if (memoCache.has(question)) {
        const sql = memoCache.get(question)!;

        const rows = await db.all(sql);

        output = { sql, result: rows };
      } else {
        const sql = await questionToSQL(question, db);

        const rows = await db.all(sql);

        memoCache.set(question, sql);

        output = { sql, result: rows };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(output) }],
        structuredContent: output,
      };
    } finally {
      await db.close();
    }
  },
);

export { mcpServer };
