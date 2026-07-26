import { File, FileMode, Paths } from 'expo-file-system';

import type { CommandLog, LogRecord } from '../../storage/commandLog';

const encoder = new TextEncoder();

/** Newline-delimited JSON written through a held append handle. */
export function createAppendFileLog(name: string): CommandLog {
  const file = new File(Paths.document, name);
  if (!file.exists) {
    file.create({ intermediates: true, overwrite: false });
  }
  let handle = file.open(FileMode.Append);

  return {
    append(record) {
      handle.writeBytes(encoder.encode(`${JSON.stringify(record)}\n`));
    },
    readAll() {
      return file
        .textSync()
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as LogRecord);
    },
    clear() {
      handle.close();
      file.delete();
      file.create({ intermediates: true, overwrite: true });
      handle = file.open(FileMode.Append);
    },
  };
}
