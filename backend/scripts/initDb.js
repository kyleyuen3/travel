// Creates the database (if missing) and runs schema.sql.
// Usage: npm run db:init
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const dbName = process.env.DB_NAME || 'travel_app';
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) throw new Error(`Unsafe DB_NAME: ${dbName}`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await conn.query(`USE \`${dbName}\``);
  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  await conn.query(schema);
  await conn.end();

  console.log(`Database "${dbName}" is ready.`);
}

main().catch((err) => {
  console.error('db:init failed:', err.message);
  process.exit(1);
});
