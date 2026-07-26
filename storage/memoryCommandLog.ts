import type { CommandLog, LogRecord } from './commandLog';

/**
 * An in-memory log with the same semantics as the durable one, minus the durability. Lets anything
 * built on `CommandLog` be tested without a native binding.
 */
export function createMemoryCommandLog(): CommandLog {
  const records: LogRecord[] = [];

  return {
    append(record) {
      if (!records.some((existing) => existing.id === record.id)) {
        records.push(record);
      }
    },
    readAll() {
      return [...records];
    },
    clear() {
      records.length = 0;
    },
  };
}
