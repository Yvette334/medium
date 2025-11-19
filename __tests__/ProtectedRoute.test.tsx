import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SessionProvider } from 'next-auth/react';

const mockRouter = {
  push: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
  });

  it('renders children when user is authenticated', () => {
    const mockSession = {
      user: { email: 'test@example.com' },
      expires: '2024-12-31',
    };

    render(
      <SessionProvider session={mockSession}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </SessionProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    render(
      <SessionProvider session={null}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </SessionProvider>
    );

    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });
});

