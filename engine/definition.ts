/**
 * A game is data the engine runs, not code it branches on. Adding a game means authoring a
 * definition, never editing the engine.
 */

export type InputField = {
  key: string;
  label: string;
};

export type GameDefinition = {
  id: string;
  name: string;
  fields: InputField[];
  /** The only per-game code there is: pure, per-player, exhaustively tested. */
  score: (values: Record<string, number>) => number;
};

/** Definitions are resolved by id because a game pins its definition when it is dealt. */
export type DefinitionRegistry = Record<string, GameDefinition>;
