import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

describe('Card', () => {
  it('renders card with title and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content here</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Card content here')).toBeInTheDocument();
  });

  it('renders card with just content', () => {
    render(
      <Card>
        <CardContent>
          <p>Simple card</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Simple card')).toBeInTheDocument();
  });
});
