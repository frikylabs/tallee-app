import * as SQLite from 'expo-sqlite';

import type { CommandLog, LogRecord } from '../../storage/commandLog';

/** The platform SQLite binding, on its synchronous prepared-statement path. */
export function createExpoSqliteLog(name: string): CommandLog {
  const db = SQLite.openDatabaseSync(name);
  db.execSync('PRAGMA journal_mode = WAL');
  db.execSync(
    'CREATE TABLE IF NOT EXISTS log (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, body TEXT NOT NULL)'
  );
  const insert = db.prepareSync('INSERT INTO log (id, body) VALUES (?, ?)');

  return {
    append(record) {
      insert.executeSync(record.id, record.body);
    },
    readAll() {
      return db.getAllSync<LogRecord>('SELECT id, body FROM log ORDER BY seq');
    },
    clear() {
      db.execSync('DELETE FROM log');
    },
  };
}
