import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

// Mock Firebase modules
vi.mock('../firebase', () => ({
  auth: {},
  db: {}
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

// Test component to consume the context
const TestComponent = () => {
  const { currentUser, loading, isAdmin } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <div>Not logged in</div>;
  return (
    <div>
      <div data-testid="user-email">{currentUser.email}</div>
      <div data-testid="user-role">{currentUser.role}</div>
      <div data-testid="is-admin">{isAdmin.toString()}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (onAuthStateChanged as any).mockImplementation(() => vi.fn());
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });

  it('renders user data when authenticated as admin', async () => {
    // Mock authenticated user
    const mockUser = {
      uid: '123',
      email: 'admin@example.com',
      displayName: 'Admin User',
      photoURL: ''
    };

    // Mock onAuthStateChanged to immediately call the callback with user
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return vi.fn(); // unsubscribe function
    });

    // Mock Firestore getDoc to return admin role
    (getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    });
  });

  it('renders guest state when not authenticated', async () => {
    // Mock onAuthStateChanged to call callback with null
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });
});
