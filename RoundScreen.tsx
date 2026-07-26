import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Command } from './engine/commands';
import { type GameState } from './engine/reduce';
import { createSession, stamp } from './engine/session';
import { definitions, fixture } from './games/fixture';
import type { CommandLog } from './storage/commandLog';
import { createSqliteCommandLog } from './storage/sqliteCommandLog';
import { palette } from './theme';

/**
 * Throwaway surface for the walking skeleton. Everything on screen is derived from the log by
 * replaying it; nothing here holds game state of its own.
 *
 */

const SLOTS = [
  { id: 's1', name: 'Slot one' },
  { id: 's2', name: 'Slot two' },
  { id: 's3', name: 'Slot three' },
];

const OPENING_ENTRY: Record<string, Record<string, number>> = {
  s1: { bid: 2, taken: 2 },
  s2: { bid: 3, taken: 1 },
  s3: { bid: 1, taken: 1 },
};

/** The log is injectable so the screen can be exercised without a native binding. */
export default function RoundScreen({ log }: { log?: CommandLog }) {
  const session = useMemo(
    () => createSession(log ?? createSqliteCommandLog('tallee.db'), definitions),
    [log],
  );
  const [state, setState] = useState<GameState>(() => session.state());
  const [entry, setEntry] = useState(OPENING_ENTRY);

  const dispatch = useCallback(
    (command: Command) => setState(session.dispatch(command)),
    [session],
  );

  const deal = useCallback(
    () => dispatch(stamp({ kind: 'DealGame', definitionId: fixture.id, slots: SLOTS })),
    [dispatch],
  );

  const commit = useCallback(() => {
    dispatch(
      stamp({
        kind: 'CommitRound',
        inputs: SLOTS.map((slot) => ({ slotId: slot.id, values: entry[slot.id] ?? {} })),
      }),
    );
  }, [dispatch, entry]);

  const clear = useCallback(() => setState(session.clear()), [session]);

  const nudge = (slotId: string, field: string, by: number) =>
    setEntry((current) => {
      const values = current[slotId] ?? {};
      return {
        ...current,
        [slotId]: { ...values, [field]: Math.max(0, (values[field] ?? 0) + by) },
      };
    });

  if (!state.definitionId) {
    return (
      <View style={styles.screen}>
        <Text style={styles.wordmark}>Tallee</Text>
        <View style={styles.rule} />
        <Text style={styles.muted}>No games yet</Text>
        <Pressable style={styles.button} onPress={deal}>
          <Text style={styles.buttonLabel}>Deal</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.wordmark}>{fixture.name}</Text>
      <View style={styles.rule} />
      <Text style={styles.muted}>
        {state.rounds.length === 0
          ? 'No rounds yet'
          : `${state.rounds.length} round${state.rounds.length === 1 ? '' : 's'} played`}
        {' · dealing: '}
        {state.slots[state.dealerIndex]?.name ?? '—'}
      </Text>

      {state.slots.map((slot) => (
        <View key={slot.id} style={styles.slot}>
          <View style={styles.slotHeader}>
            <Text style={styles.name}>{slot.name}</Text>
            <Text style={styles.total}>{state.totals[slot.id] ?? 0}</Text>
          </View>
          <View style={styles.steppers}>
            {fixture.fields.map((field) => (
              <View key={field.key} style={styles.stepper}>
                <Pressable style={styles.nudge} onPress={() => nudge(slot.id, field.key, -1)}>
                  <Text style={styles.nudgeLabel}>−</Text>
                </Pressable>
                <Text style={styles.value}>
                  {field.label} {entry[slot.id]?.[field.key] ?? 0}
                </Text>
                <Pressable style={styles.nudge} onPress={() => nudge(slot.id, field.key, 1)}>
                  <Text style={styles.nudgeLabel}>+</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Pressable style={styles.button} onPress={commit}>
        <Text style={styles.buttonLabel}>Commit round</Text>
      </Pressable>
      <Pressable onPress={clear}>
        <Text style={styles.clear}>Clear log</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ground,
    gap: 16,
    padding: 24,
  },
  wordmark: { color: palette.ink, fontSize: 34, fontWeight: '300', letterSpacing: 1 },
  rule: { width: 48, height: 1, backgroundColor: palette.brass },
  muted: { color: palette.ink, fontSize: 14, opacity: 0.5 },
  slot: { width: '100%', maxWidth: 320, gap: 4 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { color: palette.ink, fontSize: 15 },
  total: { color: palette.brass, fontSize: 17 },
  steppers: { flexDirection: 'row', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  nudge: { paddingHorizontal: 10, paddingVertical: 2 },
  nudgeLabel: { color: palette.brass, fontSize: 18 },
  value: {
    color: palette.ink,
    fontSize: 13,
    opacity: 0.7,
    minWidth: 64,
    textAlign: 'center',
  },
  button: {
    borderColor: palette.brass,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  buttonLabel: { color: palette.brass, fontSize: 15 },
  clear: { color: palette.ink, fontSize: 12, opacity: 0.4 },
});
