import { render, screen } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

// Mock the useAuthState hook
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [null, false],
}));

const TestComponent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>{user ? `User: ${user.displayName}` : 'No user'}</div>;
};

describe('AuthContext', () => {
  it('provides auth state to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('No user')).toBeInTheDocument();
  });
});
