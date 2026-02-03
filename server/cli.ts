import { questionToSQLResult } from "./src/services/question-to-sql.ts";

async function main() {
  const question = process.argv[2];
  const results = await questionToSQLResult(question);

  console.log("Results:", results);
}

main();
