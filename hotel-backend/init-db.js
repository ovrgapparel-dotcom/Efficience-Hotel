const { Pool } = require("pg");
const fs = require("fs");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync('database.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log("Supabase Tables successfully created!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error creating tables:", err);
    process.exit(1);
  });
