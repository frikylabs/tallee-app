import { open } from '@op-engineering/op-sqlite';

import type { CommandLog, LogRecord } from '../../storage/commandLog';

/**
 * The synchronous JSI SQLite alternative. Its prepared statements only execute asynchronously, so
 * the fair synchronous path is a parameterised `executeSync` — noted in the ADR as an asymmetry.
 */
export function createOpSqliteLog(name: string): CommandLog {
  const db = open({ name });
  db.executeSync('PRAGMA journal_mode = WAL');
  db.executeSync(
    'CREATE TABLE IF NOT EXISTS log (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, body TEXT NOT NULL)'
  );

  return {
    append(record) {
      db.executeSync('INSERT INTO log (id, body) VALUES (?, ?)', [record.id, record.body]);
    },
    readAll() {
      return db.executeSync('SELECT id, body FROM log ORDER BY seq').rows as LogRecord[];
    },
    clear() {
      db.executeSync('DELETE FROM log');
    },
  };
}
