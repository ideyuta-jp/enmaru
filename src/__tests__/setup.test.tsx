import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

// Smoke test for the unit-test harness (Vitest + jsdom + Testing Library).
// Safe to delete once real tests exist.
describe('test harness', () => {
  it('renders into jsdom', () => {
    render(<h1>enmaru</h1>);
    expect(
      screen.getByRole('heading', {name: 'enmaru'}),
    ).toBeInTheDocument();
  });
});
