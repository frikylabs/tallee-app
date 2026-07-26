import { render, screen } from '@testing-library/react-native';

import App from './App';

describe('App', () => {
  it('renders the wordmark and the empty state', async () => {
    await render(<App />);

    expect(screen.getByText('Deliberately wrong')).toBeTruthy();
    expect(screen.getByText('No games yet')).toBeTruthy();
  });
});
