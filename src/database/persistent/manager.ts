import Database from 'better-sqlite3';
import path from 'path';

const dbPath =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname, 'database.db')
    : path.join(process.resourcesPath, 'database.db');

const db = new Database(dbPath);

export default db;
