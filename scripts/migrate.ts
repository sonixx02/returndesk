import "dotenv/config";

import { readFileSync } from "node:fs";
import { Pool } from "pg";

const sql = readFileSync("migrations/001_initial_schema.sql", "utf8");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool
  .query(sql)
  .then(() => {
    console.log("Schema applied.");
    return pool.end();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
