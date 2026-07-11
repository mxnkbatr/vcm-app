const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

(async () => {
  const sql = fs.readFileSync(
    path.join(__dirname, "../supabase/migrations/001_profiles.sql"),
    "utf8"
  );
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Supabase migration applied");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
