/**
 * Smoke test for the StatsCard component. The real contract is
 * visual, but we at least confirm it renders without crashing and
 * that the value text is in the tree.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { StatsCard } from '@/components/common/StatsCard';

describe('StatsCard', () => {
  it('renders the value as plain text', () => {
    const { getByText } = render(<StatsCard label="Streak" value={12} />);
    expect(getByText('12')).toBeTruthy();
    expect(getByText('Streak')).toBeTruthy();
  });

  it('renders an optional delta', () => {
    const { getByText } = render(
      <StatsCard label="Streak" value={12} delta="+2 hôm nay" />
    );
    expect(getByText('+2 hôm nay')).toBeTruthy();
  });

  it('renders an icon when provided', () => {
    const { getByText } = render(
      <StatsCard
        label="Streak"
        value={12}
        icon={<Text>🔥</Text>}
      />
    );
    expect(getByText('🔥')).toBeTruthy();
  });
});
