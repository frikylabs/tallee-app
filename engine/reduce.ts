import type { Command } from './commands';
import type { DefinitionRegistry } from './definition';

export type Slot = { id: string; name: string };

export type Round = {
  /** What was entered, kept verbatim: the round matrix later derives from this, never from totals. */
  inputs: { slotId: string; values: Record<string, number> }[];
};

export type GameState = {
  definitionId: string | null;
  slots: Slot[];
  /** Rotates each round, carried across games. */
  dealerIndex: number;
  rounds: Round[];
  totals: Record<string, number>;
};

export const emptyState: GameState = {
  definitionId: null,
  slots: [],
  dealerIndex: 0,
  rounds: [],
  totals: {},
};

/**
 * `(state, command) -> state`, pure and total.
 *
 * A command this build does not understand leaves state untouched rather than throwing: logs are
 * kept forever and gossiped between versions, so an older build must be able to replay a newer log
 * and simply ignore what it cannot interpret.
 */
export function reduce(
  state: GameState,
  command: Command,
  definitions: DefinitionRegistry,
): GameState {
  switch (command.kind) {
    case 'DealGame':
      return {
        definitionId: command.definitionId,
        slots: command.slots,
        dealerIndex: 0,
        rounds: [],
        totals: Object.fromEntries(command.slots.map((slot) => [slot.id, 0])),
      };

    case 'CommitRound': {
      const definition = state.definitionId ? definitions[state.definitionId] : undefined;
      if (!definition) {
        return state;
      }

      const totals = { ...state.totals };
      for (const input of command.inputs) {
        totals[input.slotId] = (totals[input.slotId] ?? 0) + definition.score(input.values);
      }

      const rounds = [...state.rounds, { inputs: command.inputs }];
      return {
        ...state,
        dealerIndex: state.slots.length === 0 ? 0 : rounds.length % state.slots.length,
        rounds,
        totals,
      };
    }

    default:
      return state;
  }
}

/** Folds a whole log into state. This is the only way state is ever produced. */
export function replay(commands: Command[], definitions: DefinitionRegistry): GameState {
  return commands.reduce((state, command) => reduce(state, command, definitions), emptyState);
}
