/**
 * One appended command. The log treats `body` as opaque — the engine owns its shape — and relies
 * only on `id` being globally unique, so merging two logs is a union rather than a reconciliation.
 */
export type LogRecord = {
  id: string;
  body: string;
};

/**
 * Durable, append-only storage for the command stream.
 *
 * Appends are synchronous and durable once they return, so a command applied to state is already
 * on disk and there is no window in which state and log disagree. Records are never updated or
 * deleted: undo and amend append compensating commands. Reads happen once, at startup, in append
 * order.
 */
export type CommandLog = {
  append(record: LogRecord): void;
  readAll(): LogRecord[];
  clear(): void;
};
