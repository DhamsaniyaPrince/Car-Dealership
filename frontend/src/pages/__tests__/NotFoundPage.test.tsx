import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { NotFoundPage } from '../NotFoundPage';

describe('NotFoundPage Tests', () => {
  it('should render 404 header and navigation help link', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Lost in Transit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to safety/i })).toBeInTheDocument();
  });
});
