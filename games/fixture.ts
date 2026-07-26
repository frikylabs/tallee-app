import type { GameDefinition } from '../engine/definition';

/**
 * A stand-in definition for the walking skeleton — enough shape to exercise the engine end to end,
 * deliberately not an authored game. Bidding rewards an exact call and penalises the distance from
 * it, which is the smallest rule that makes a round's scores depend on more than one input field.
 */
export const fixture: GameDefinition = {
  id: 'fixture',
  name: 'Fixture',
  fields: [
    { key: 'bid', label: 'Bid' },
    { key: 'taken', label: 'Taken' },
  ],
  score: (values) => {
    const bid = values.bid ?? 0;
    const taken = values.taken ?? 0;
    return bid === taken ? 20 + 10 * taken : -10 * Math.abs(bid - taken);
  },
};

export const definitions = { [fixture.id]: fixture };
