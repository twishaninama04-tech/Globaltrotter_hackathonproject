import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'globetrotter.db');
const db = new Database(dbPath);

// Enable foreign keys & WAL mode for speed and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
