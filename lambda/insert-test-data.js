// Quick script to insert test data via Lambda
const fs = require('fs');
const sql = fs.readFileSync('./database/test-data.sql', 'utf8');

// Split into individual statements (rough split by semicolon)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(JSON.stringify({
  statements: statements.length,
  sql: sql
}));
