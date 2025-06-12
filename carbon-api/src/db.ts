import Database from 'better-sqlite3';

export const db = new Database('carbonswap.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
                                         id          INTEGER PRIMARY KEY AUTOINCREMENT,
                                         full_name   TEXT    NOT NULL,
                                         email       TEXT    UNIQUE NOT NULL,
                                         password    TEXT    NOT NULL,
                                         created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
    );
`);

export interface User {
    id: number;
    full_name: string;
    email: string;
    password: string;
    created_at: string;
}
