import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { mcpServer } from "./src/mcp-server.ts";

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

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = 3002;

app
  .listen(PORT, () => {
    console.log(`✅ MCP server running on http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
