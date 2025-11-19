import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClapButton } from '@/components/ClapButton';
import { SessionProvider } from 'next-auth/react';

const mockSession = {
  user: { email: 'test@example.com' },
  expires: '2024-12-31',
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ClapButton', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders clap button with initial count', () => {
    render(
      <SessionProvider session={mockSession}>
        <ClapButton postId="123" initialClaps={5} />
      </SessionProvider>
    );
    expect(screen.getByText('👏 5')).toBeInTheDocument();
  });

  it('increments clap count on click', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ claps: 6 }) });
    
    render(
      <SessionProvider session={mockSession}>
        <ClapButton postId="123" initialClaps={5} />
      </SessionProvider>
    );

    const button = screen.getByText('👏 5');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('👏 6')).toBeInTheDocument();
    });
  });
});

