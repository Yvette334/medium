import { render, screen, waitFor } from '@testing-library/react';
import { CommentsSection } from '@/components/CommentsSection';
import { SessionProvider } from 'next-auth/react';

const mockSession = {
  user: { email: 'test@example.com' },
  expires: '2024-12-31',
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CommentsSection', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders comments section', () => {
    mockFetch.mockResolvedValueOnce({ json: async () => [] });
    
    render(
      <SessionProvider session={mockSession}>
        <CommentsSection postId="123" />
      </SessionProvider>
    );

    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('displays comments when available', async () => {
    const mockComments = [
      {
        id: '1',
        postId: '123',
        authorEmail: 'author@example.com',
        authorName: 'Author',
        body: 'Test comment',
        createdAt: new Date().toISOString(),
      },
    ];

    mockFetch.mockResolvedValueOnce({ json: async () => mockComments });

    render(
      <SessionProvider session={mockSession}>
        <CommentsSection postId="123" />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });
  });
});

