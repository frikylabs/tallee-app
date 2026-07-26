import { definitions, fixture } from '../games/fixture';
import type { Command } from './commands';
import { emptyState, reduce, replay } from './reduce';

const deal: Command = {
  v: 1,
  id: 'c1',
  at: 1,
  kind: 'DealGame',
  definitionId: fixture.id,
  slots: [
    { id: 's1', name: 'One' },
    { id: 's2', name: 'Two' },
  ],
};

const round: Command = {
  v: 1,
  id: 'c2',
  at: 2,
  kind: 'CommitRound',
  inputs: [
    { slotId: 's1', values: { bid: 2, taken: 2 } },
    { slotId: 's2', values: { bid: 3, taken: 1 } },
  ],
};

describe('replay', () => {
  it('derives the empty state from an empty log', () => {
    expect(replay([], definitions)).toEqual(emptyState);
  });

  it('scores a committed round into running totals', () => {
    const state = replay([deal, round], definitions);

    expect(state.rounds).toHaveLength(1);
    expect(state.totals).toEqual({ s1: 40, s2: -20 });
  });

  it('keeps the round inputs verbatim, not just their totals', () => {
    const state = replay([deal, round], definitions);

    expect(state.rounds[0]?.inputs).toEqual([
      { slotId: 's1', values: { bid: 2, taken: 2 } },
      { slotId: 's2', values: { bid: 3, taken: 1 } },
    ]);
  });

  it('accumulates across rounds and rotates the dealer', () => {
    const second: Command = { ...round, id: 'c3', at: 3 };
    const state = replay([deal, round, second], definitions);

    expect(state.rounds).toHaveLength(2);
    expect(state.totals).toEqual({ s1: 80, s2: -40 });
    expect(state.dealerIndex).toBe(0);
  });

  it('is deterministic — the same log always yields the same state', () => {
    expect(replay([deal, round], definitions)).toEqual(replay([deal, round], definitions));
  });

  it('is a fold — replaying a prefix then the rest matches replaying the whole log', () => {
    const prefix = replay([deal], definitions);
    const resumed = reduce(prefix, round, definitions);

    expect(resumed).toEqual(replay([deal, round], definitions));
  });

  it('ignores a command kind it does not understand rather than failing', () => {
    const unknown = { v: 1, id: 'c9', at: 9, kind: 'FromANewerBuild' } as unknown as Command;

    expect(replay([deal, round, unknown], definitions)).toEqual(replay([deal, round], definitions));
  });

  it('ignores a round with no game dealt', () => {
    expect(replay([round], definitions)).toEqual(emptyState);
  });
});
