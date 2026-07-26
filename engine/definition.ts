/**
 * A game is data the engine runs, not code it branches on. The engine dispatches on the scoring
 * archetype — a small bounded set — never on which game is being played.
 */

/** Context a score function may depend on beyond the player's own input. */
export type ScoreContext = {
  round: number;
};

export type InputField = {
  key: string;
  label: string;
  min: number;
  max: number;
};

export type GameDefinition = {
  id: string;
  name: string;
  /** v1 implements this archetype only; the field exists so adding another is not engine surgery. */
  archetype: 'accumulator';
  winner: 'highest' | 'lowest';
  fields: InputField[];
  /** The only per-game code there is: pure, per-player, exhaustively tested. */
  score: (values: Record<string, number>, context: ScoreContext) => number;
};

/** Definitions are resolved by id because a game pins its definition when it is dealt. */
export type DefinitionRegistry = Record<string, GameDefinition>;
