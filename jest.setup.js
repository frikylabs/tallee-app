// `expo-crypto` is a native module, so under Jest `randomUUID` returns undefined. Commands are keyed
// by id and the log deduplicates by it, so undefined ids would make every command after the first
// silently vanish. Supply real ids instead.
jest.mock('expo-crypto', () => ({
  randomUUID: () => {
    const hex = () =>
      Math.floor(Math.random() * 0x10000)
        .toString(16)
        .padStart(4, '0');
    return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-8${hex().slice(1)}-${hex()}${hex()}${hex()}`;
  },
}));
