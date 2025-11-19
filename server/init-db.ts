import sqlite3 from "sqlite3";
import { open } from "sqlite";

const db = await open({
  filename: "./database.db",
  driver: sqlite3.Database,
});

async function init() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // create a table for posts with for each user
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // create a table for comments with for each post
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.exec(`
    INSERT INTO users (name, email)
    VALUES
      ('Alice', 'alice@example.com'),
      ('Bob', 'bob@example.com'),
      ('Charlie', 'charlie@example.com')
  `);

  await db.exec(`
    INSERT INTO posts (user_id, title, content)
    VALUES
      (1, 'Post 1', 'Content of Post 1'),
      (2, 'Post 2', 'Content of Post 2'),
      (3, 'Post 3', 'Content of Post 3')
  `);

  await db.exec(`
    INSERT INTO comments (post_id, user_id, content)
    VALUES
      (1, 2, 'Comment 1 on Post 1'),
      (1, 3, 'Comment 2 on Post 1'),
      (2, 1, 'Comment 1 on Post 2'),
      (2, 3, 'Comment 2 on Post 2'),
      (3, 1, 'Comment 1 on Post 3'),
      (3, 2, 'Comment 2 on Post 3')
  `);

  await db.exec(`
    INSERT INTO comments (post_id, user_id, content)
    VALUES
      (1, 2, 'Comment 3 on Post 1'),
      (1, 3, 'Comment 4 on Post 1'),
      (2, 1, 'Comment 3 on Post 2'),
      (2, 3, 'Comment 4 on Post 2'),
      (3, 1, 'Comment 3 on Post 3'),
      (3, 2, 'Comment 4 on Post 3')
  `);

  console.log("✅ Database initialized.");
}

// (async () => {
//   const rows = await db.all("SELECT * FROM sqlite_master;");
//   console.log(rows);
// })();

init();
