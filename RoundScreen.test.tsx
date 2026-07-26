import { act, cleanup, render, screen, userEvent } from '@testing-library/react-native';

import RoundScreen from './RoundScreen';
import { createMemoryCommandLog } from './storage/memoryCommandLog';

describe('RoundScreen', () => {
  it('shows the empty state when the log is empty', async () => {
    await render(<RoundScreen log={createMemoryCommandLog()} />);

    expect(screen.getByText('Tallee')).toBeTruthy();
    expect(screen.getByText('No games yet')).toBeTruthy();
  });

  it('derives the board from the log once a game is dealt', async () => {
    const user = userEvent.setup();
    await render(<RoundScreen log={createMemoryCommandLog()} />);

    await user.press(screen.getByText('Deal'));

    expect(screen.getByText(/No rounds yet/)).toBeTruthy();
    expect(screen.getByText('Slot one')).toBeTruthy();
  });

  it('derives totals from a committed round', async () => {
    const user = userEvent.setup();
    await render(<RoundScreen log={createMemoryCommandLog()} />);

    await user.press(screen.getByText('Deal'));
    await user.press(screen.getByText('Commit round'));

    expect(screen.getByText(/1 round played/)).toBeTruthy();
    expect(screen.getByText('40')).toBeTruthy();
    expect(screen.getByText('-20')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('rebuilds the same board from a log it did not write', async () => {
    const log = createMemoryCommandLog();
    const user = userEvent.setup();

    await render(<RoundScreen log={log} />);
    await user.press(screen.getByText('Deal'));
    await user.press(screen.getByText('Commit round'));

    // A second mount over the same log stands in for a relaunch: no state crosses over, so whatever
    // it shows was rebuilt by replaying what the first mount wrote.
    await act(async () => cleanup());
    await render(<RoundScreen log={log} />);

    expect(screen.getByText(/1 round played/)).toBeTruthy();
    expect(screen.getByText('40')).toBeTruthy();
  });
});
