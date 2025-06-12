import Database from 'better-sqlite3';
export const db = new Database('carbonswap.db');

db.exec(`CREATE TABLE IF NOT EXISTS users (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              address TEXT UNIQUE,
                                              first_name TEXT,
                                              last_name TEXT,
                                              email TEXT,
                                              created_at TEXT DEFAULT CURRENT_TIMESTAMP
         );`);

export interface User {
    id: number;
    address: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}