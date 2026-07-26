import * as SQLite from 'expo-sqlite';

import type { CommandLog, LogRecord } from './commandLog';

/**
 * The durable command log, on SQLite's synchronous prepared-statement path.
 *
 * `id` is UNIQUE because merging a peer's log is a union over ids, not a reconciliation: reinserting
 * a record already present is a no-op rather than a conflict. `seq` preserves local append order,
 * which is the order the reducer replays.
 *
 * Rationale in `docs/decisions/0006-sqlite-command-log.md`.
 */
export function createSqliteCommandLog(databaseName: string): CommandLog {
  const db = SQLite.openDatabaseSync(databaseName);
  db.execSync('PRAGMA journal_mode = WAL');
  db.execSync(
    'CREATE TABLE IF NOT EXISTS log (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, body TEXT NOT NULL)',
  );
  const insert = db.prepareSync('INSERT OR IGNORE INTO log (id, body) VALUES (?, ?)');

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
