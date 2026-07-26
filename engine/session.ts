import * as Crypto from 'expo-crypto';

import type { CommandLog } from '../storage/commandLog';
import type { Command } from './commands';
import type { DefinitionRegistry } from './definition';
import { replay, type GameState } from './reduce';

/**
 * Fills in the envelope every command shares, so callers only describe what happened.
 *
 * A missing id is fatal rather than tolerated: ids are what make merging two logs a union, so a log
 * would silently swallow every command after the first one that failed to mint.
 */
export function stamp<T extends { kind: Command['kind'] }>(body: T): T & Command {
  const id = Crypto.randomUUID();
  if (!id) {
    throw new Error('Refusing to stamp a command without a unique id');
  }
  return { v: 1, id, at: Date.now(), ...body } as T & Command;
}

/**
 * Binds the log to the reducer: commands go in, state is derived back out.
 *
 * State is recomputed from the whole log on every read rather than cached. That is the property the
 * skeleton exists to prove — nothing is ever mutated in place — and at a few hundred commands a
 * night the fold is free.
 */
export function createSession(log: CommandLog, definitions: DefinitionRegistry) {
  const read = (): Command[] => log.readAll().map((record) => JSON.parse(record.body) as Command);

  return {
    state: (): GameState => replay(read(), definitions),
    dispatch(command: Command): GameState {
      log.append({ id: command.id, body: JSON.stringify(command) });
      return replay(read(), definitions);
    },
    clear(): GameState {
      log.clear();
      return replay(read(), definitions);
    },
  };
}
