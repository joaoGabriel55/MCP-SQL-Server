import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { z } from "zod";
import { questionToSQL } from "./src/services/question-to-sql.ts";

const memoCache = new Map<string, string>();

async function openDB() {
  return open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
}

const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

server.registerTool(
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
        const sql = await questionToSQL(question);

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

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = 3001;

app
  .listen(PORT, () => {
    console.log(`✅ MCP server running on http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
