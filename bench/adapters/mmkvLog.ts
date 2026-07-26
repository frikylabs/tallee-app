import { createMMKV } from 'react-native-mmkv';

import type { CommandLog, LogRecord } from '../../storage/commandLog';

/** Keys are zero-padded so lexicographic order is append order. */
const keyFor = (seq: number) => `c${String(seq).padStart(9, '0')}`;

/** A key-value store emulating a log: one key per record, sequence encoded in the key. */
export function createMmkvLog(id: string): CommandLog {
  const kv = createMMKV({ id });
  let next = kv.getAllKeys().length;

  return {
    append(record) {
      kv.set(keyFor(next), JSON.stringify(record));
      next += 1;
    },
    readAll() {
      const records: LogRecord[] = [];
      for (const key of kv.getAllKeys().sort()) {
        const raw = kv.getString(key);
        if (raw !== undefined) {
          records.push(JSON.parse(raw) as LogRecord);
        }
      }
      return records;
    },
    clear() {
      kv.clearAll();
      next = 0;
    },
  };
}
