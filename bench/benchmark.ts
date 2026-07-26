import { File, Paths } from 'expo-file-system';

import type { CommandLog, LogRecord } from '../storage/commandLog';
import { createAppendFileLog } from './adapters/appendFile';
import { createExpoSqliteLog } from './adapters/expoSqlite';
import { createMmkvLog } from './adapters/mmkvLog';
import { createOpSqliteLog } from './adapters/opSqlite';

export const RECORD_COUNT = 10_000;

const FILE_NAME = 'bench-log.jsonl';

const now = () => globalThis.performance?.now?.() ?? Date.now();

/** A realistic command envelope: versioned, uniquely keyed, a couple of hundred bytes. */
export function makeRecord(seq: number): LogRecord {
  return {
    id: `9f2c1b7a-0000-4000-8000-${String(seq).padStart(12, '0')}`,
    body: JSON.stringify({
      v: 1,
      kind: 'CommitRoundScore',
      at: 1753500000000 + seq * 37,
      nightId: '4b0e9d2f-1c88-4a51-9d3e-77c1a0b2e5f4',
      gameId: 'e21a7c60-5b93-4d17-8f2a-9c40de13b8aa',
      slot: seq % 4,
      round: Math.floor(seq / 4) + 1,
      values: { bid: seq % 7, tricks: (seq * 3) % 7 },
      by: 'd41d8cd98f00b204e9800998ecf8427e',
    }),
  };
}

type Candidate = { name: string; create: () => CommandLog };

const candidates: Candidate[] = [
  { name: 'append-only file', create: () => createAppendFileLog(FILE_NAME) },
  { name: 'expo-sqlite', create: () => createExpoSqliteLog('bench-expo.db') },
  { name: 'op-sqlite', create: () => createOpSqliteLog('bench-op.db') },
  { name: 'mmkv', create: () => createMmkvLog('bench-mmkv') },
];

export type Phase = 'write' | 'read' | 'crash-write';

/** Dropped into the app's Documents directory from the host to request the interleaved run. */
const CRASH_MARKER = 'bench-crash-mode';

export type Result = {
  name: string;
  ms: number;
  count: number;
  error?: string;
};

/**
 * Emptiness is probed by file size rather than by reading the log, so the probe does not warm the
 * cache for one candidate and skew its cold read.
 */
function writePhaseIsNext(): boolean {
  const file = new File(Paths.document, FILE_NAME);
  return !file.exists || (file.size ?? 0) === 0;
}

function runWritePhase(): Result[] {
  return candidates.map(({ name, create }) => {
    try {
      const log = create();
      log.clear();
      const started = now();
      for (let seq = 0; seq < RECORD_COUNT; seq += 1) {
        log.append(makeRecord(seq));
      }
      return { name, ms: now() - started, count: RECORD_COUNT };
    } catch (error) {
      return { name, ms: 0, count: 0, error: String(error) };
    }
  });
}

/**
 * Reads every candidate back in a process that has never written to it, then empties it so the
 * next launch is a write phase again. A candidate that throws is reported rather than aborting the
 * run — a torn log is a result, not a crash.
 */
function runReadPhase(): Result[] {
  return candidates.map(({ name, create }) => {
    try {
      const log = create();
      const started = now();
      const records = log.readAll();
      const ms = now() - started;
      log.clear();
      return { name, ms, count: records.length };
    } catch (error) {
      try {
        create().clear();
      } catch {
        // A store too damaged to clear is itself the finding.
      }
      return { name, ms: 0, count: 0, error: String(error) };
    }
  });
}

/**
 * Appends to every candidate round-robin, so a kill tears all four at the same instant instead of
 * only whichever store a sequential run happened to be inside. Deliberately runs far past
 * RECORD_COUNT: the loop must still be going whenever the kill lands, so it is never expected to
 * finish. Untimed — the timings come from the sequential phases.
 */
function runInterleavedWrite(): Result[] {
  const logs = candidates.map(({ name, create }) => ({ name, log: create() }));
  for (const { log } of logs) {
    log.clear();
  }

  let written = 0;
  for (let seq = 0; seq < RECORD_COUNT * 20; seq += 1) {
    const record = makeRecord(seq);
    for (const { log } of logs) {
      log.append(record);
    }
    written = seq + 1;
  }
  return logs.map(({ name }) => ({ name, ms: 0, count: written }));
}

export function runBenchmark(): { phase: Phase; results: Result[] } {
  if (writePhaseIsNext()) {
    return new File(Paths.document, CRASH_MARKER).exists
      ? { phase: 'crash-write', results: runInterleavedWrite() }
      : { phase: 'write', results: runWritePhase() };
  }
  return { phase: 'read', results: runReadPhase() };
}
