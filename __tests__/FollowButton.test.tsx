import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FollowButton } from '@/components/FollowButton';
import { SessionProvider } from 'next-auth/react';

const mockSession = {
  user: { email: 'test@example.com' },
  expires: '2024-12-31',
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FollowButton', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders follow button when not following', () => {
    render(
      <SessionProvider session={mockSession}>
        <FollowButton authorEmail="author@example.com" initialFollowing={false} />
      </SessionProvider>
    );
    expect(screen.getByText('Follow')).toBeInTheDocument();
  });

  it('renders following state when already following', () => {
    render(
      <SessionProvider session={mockSession}>
        <FollowButton authorEmail="author@example.com" initialFollowing={true} />
      </SessionProvider>
    );
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('toggles follow state on click', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'followed' }) });
    
    render(
      <SessionProvider session={mockSession}>
        <FollowButton authorEmail="author@example.com" initialFollowing={false} />
      </SessionProvider>
    );

    const button = screen.getByText('Follow');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Following')).toBeInTheDocument();
    });
  });
});

