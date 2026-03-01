import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { questionToSQLResult } from "./src/services/question-to-sql.ts";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/question-sql-result", async (req, res) => {
  const result = await questionToSQLResult(req.body.question);
  res.json(result);
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
