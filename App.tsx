import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from './theme';

export default function App() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Text style={styles.wordmark}>Tallee</Text>
      <View style={styles.rule} />
      <Text style={styles.placeholder}>No games yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ground,
    gap: 20,
  },
  wordmark: {
    color: palette.ink,
    fontSize: 40,
    fontWeight: '300',
    letterSpacing: 1,
  },
  rule: {
    width: 48,
    height: 1,
    backgroundColor: palette.brass,
  },
  placeholder: {
    color: palette.ink,
    fontSize: 15,
    opacity: 0.5,
  },
});
