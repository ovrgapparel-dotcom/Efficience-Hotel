const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
  -- Enable RLS
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
  
  -- Revoke access to PostgREST roles for users
  REVOKE ALL ON public.users FROM anon, authenticated;
`;

pool.query(sql)
  .then(() => {
    console.log("Supabase Tables successfully secured!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error securing tables:", err);
    process.exit(1);
  });
