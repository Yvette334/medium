import { render, screen } from '@testing-library/react';
import { CommentsSection } from '@/components/CommentsSection';
import { SessionProvider } from 'next-auth/react';
import useSWR from 'swr';

jest.mock('swr');
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

const mockSession = {
  user: { email: 'test@example.com' },
  expires: '2024-12-31',
};

describe('CommentsSection', () => {
  beforeEach(() => {
    mockUseSWR.mockReset();
  });

  it('renders comments section', () => {
    mockUseSWR.mockReturnValue({ data: [], mutate: jest.fn() } as any);

    render(
      <SessionProvider session={mockSession}>
        <CommentsSection postId="123" />
      </SessionProvider>
    );

    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('displays comments when available', () => {
    mockUseSWR.mockReturnValue({
      data: [
        {
          id: '1',
          postId: '123',
          authorEmail: 'author@example.com',
          authorName: 'Author',
          body: 'Test comment',
          createdAt: new Date().toISOString(),
        },
      ],
      mutate: jest.fn(),
    } as any);

    render(
      <SessionProvider session={mockSession}>
        <CommentsSection postId="123" />
      </SessionProvider>
    );

    expect(screen.getByText('Test comment')).toBeInTheDocument();
  });
});

