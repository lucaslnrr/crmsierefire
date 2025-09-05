import mysql from 'mysql2/promise'

export async function getDB(){
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT||3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: false,
    namedPlaceholders: false
  })
  return conn
}
