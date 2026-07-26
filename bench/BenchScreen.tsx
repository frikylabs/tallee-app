import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme';
import { RECORD_COUNT, runBenchmark, type Result } from './benchmark';

type State = { phase: string; results: Result[] } | null;

export default function BenchScreen() {
  const [state, setState] = useState<State>(null);

  useEffect(() => {
    // Let the first frame paint before the JS thread blocks on the run.
    const timer = setTimeout(() => {
      const { phase, results } = runBenchmark();
      console.log(`BENCH_JSON ${JSON.stringify({ phase, records: RECORD_COUNT, results })}`);
      setState({ phase, results });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>{state ? `${state.phase} phase` : 'running…'}</Text>
      {state?.results.map((result) => (
        <Text key={result.name} style={styles.row}>
          {result.error
            ? `${result.name}: ${result.error}`
            : `${result.name}: ${result.ms.toFixed(0)} ms · ${result.count} records`}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ground,
    gap: 12,
    padding: 24,
  },
  heading: {
    color: palette.brass,
    fontSize: 20,
  },
  row: {
    color: palette.ink,
    fontSize: 13,
    textAlign: 'center',
  },
});
