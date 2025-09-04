import mysql from 'mysql2/promise'
export async function getDB(){
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error('Database env vars missing (DB_HOST, DB_USER, DB_NAME). Configure on Vercel Project Settings → Environment Variables.')
  }
  return await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASS,
    database: process.env.DB_NAME, charset:'utf8mb4',
    // dateStrings: true, // optional: uncomment if you prefer string dates
  })
}
