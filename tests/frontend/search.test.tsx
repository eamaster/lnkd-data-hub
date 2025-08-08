import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../../app/src/app/search/page';

describe('Search page', () => {
  it('renders search UI', () => {
    render(<Page /> as any);
    expect(screen.getByText('Unified Search')).toBeInTheDocument();
  });
});
