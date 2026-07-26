/**
 * The vocabulary of the command log. Every command carries a schema version and a globally unique
 * id: the version so an older build can read a newer log, the id so merging two devices' logs is a
 * union rather than a reconciliation.
 */
type Envelope = {
  v: 1;
  id: string;
  at: number;
};

/** Pins the definition and the seating order for the game about to be played. */
export type DealGame = Envelope & {
  kind: 'DealGame';
  definitionId: string;
  slots: { id: string; name: string }[];
};

/** One round's input for every slot. Values are keyed by the definition's input fields. */
export type CommitRound = Envelope & {
  kind: 'CommitRound';
  inputs: { slotId: string; values: Record<string, number> }[];
};

export type Command = DealGame | CommitRound;
