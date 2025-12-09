import { openDB } from "./src/db/open-db.ts";
import { questionToSQL } from "./src/services/question-to-sql.ts";

async function main() {
  const db = await openDB();

  const question = process.argv[2];
  const sqlQuery = await questionToSQL(question, db);

  console.log("Generated Query:", sqlQuery);

  // Execute the query
  const results = await db.all(sqlQuery);
  console.log("Results:", results);
}


main()
