import Database from 'better-sqlite3';

// Create an in-memory database
const db =
  process.env.NODE_ENV === 'development'
    ? new Database(':memory:', { verbose: console.log })
    : new Database(':memory:');

// Create a table
db.exec(`
  CREATE TABLE IF NOT EXISTS datapoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL,
    longitude REAL,
    altitude REAL,
    fix INTEGER,
    satellitesInView INTEGER,
    timestampSeconds INTEGER,
    rssi REAL,
    snr REAL,
    freqErr REAL,
    radioState INTEGER
  );
`);

export default db;
