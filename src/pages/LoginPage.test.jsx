import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './LoginPage.jsx';

/**
 * Helper to render LoginPage within a MemoryRouter at /login.
 * Includes additional routes to verify navigation on success.
 * @returns {Object} The render result.
 */
function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div>Admin Dashboard Page</div>} />
        <Route path="/dashboard" element={<div>User Dashboard Page</div>} />
        <Route path="/" element={<div>Landing Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------- Form rendering ---------------

  describe('form rendering', () => {
    it('renders the Login heading', () => {
      renderLoginPage();
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('renders the username input field', () => {
      renderLoginPage();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('renders the password input field', () => {
      renderLoginPage();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders the Sign In button', () => {
      renderLoginPage();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the Register link', () => {
      renderLoginPage();
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });

    it('renders the WriteSpace branding', () => {
      renderLoginPage();
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
    });

    it('renders the welcome message', () => {
      renderLoginPage();
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('renders username input with correct placeholder', () => {
      renderLoginPage();
      expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    });

    it('renders password input with correct placeholder', () => {
      renderLoginPage();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });

    it('password input has type password', () => {
      renderLoginPage();
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  // --------------- Successful admin login ---------------

  describe('successful admin login', () => {
    it('redirects to /admin on successful admin login', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard Page')).toBeInTheDocument();
      });
    });

    it('creates a session in localStorage after admin login', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/password/i), 'admin');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const session = JSON.parse(localStorage.getItem('writespace_session'));
        expect(session).not.toBeNull();
        expect(session.username).toBe('admin');
        expect(session.role).toBe('admin');
      });
    });
  });

  // --------------- Successful regular user login ---------------

  describe('successful regular user login', () => {
    beforeEach(() => {
      const users = [
        {
          id: 'user-1',
          username: 'alice',
          password: 'alicepass',
          displayName: 'Alice',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));
    });

    it('redirects to /dashboard on successful user login', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'alicepass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('User Dashboard Page')).toBeInTheDocument();
      });
    });

    it('creates a session in localStorage after user login', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'alicepass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const session = JSON.parse(localStorage.getItem('writespace_session'));
        expect(session).not.toBeNull();
        expect(session.username).toBe('alice');
        expect(session.role).toBe('user');
        expect(session.userId).toBe('user-1');
      });
    });
  });

  // --------------- Invalid credentials ---------------

  describe('invalid credentials show error', () => {
    it('shows error message for wrong admin password', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });

    it('shows error message for nonexistent user', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'nonexistent');
      await user.type(screen.getByLabelText(/password/i), 'somepassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });

    it('shows error message for wrong user password', async () => {
      const users = [
        {
          id: 'user-1',
          username: 'alice',
          password: 'alicepass',
          displayName: 'Alice',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));

      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'alice');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });

    it('does not create a session on failed login', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });

      const session = localStorage.getItem('writespace_session');
      expect(session).toBeNull();
    });
  });

  // --------------- Authenticated user redirect ---------------

  describe('authenticated user redirect', () => {
    it('redirects authenticated admin to /admin', async () => {
      const session = {
        username: 'admin',
        role: 'admin',
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      renderLoginPage();

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard Page')).toBeInTheDocument();
      });
    });

    it('redirects authenticated regular user to /dashboard', async () => {
      const session = {
        username: 'testuser',
        userId: 'user-1',
        role: 'user',
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      renderLoginPage();

      await waitFor(() => {
        expect(screen.getByText('User Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  // --------------- Navigation ---------------

  describe('navigation', () => {
    it('navigates to register page via Register link', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const registerLink = screen.getByRole('link', { name: /register/i });
      await user.click(registerLink);

      await waitFor(() => {
        expect(screen.getByText('Register Page')).toBeInTheDocument();
      });
    });

    it('navigates to landing page via WriteSpace logo link', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const logoLink = screen.getByRole('link', { name: /writespace/i });
      await user.click(logoLink);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });
  });

  // --------------- Form interaction ---------------

  describe('form interaction', () => {
    it('updates username input value on typing', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'testuser');
      expect(usernameInput).toHaveValue('testuser');
    });

    it('updates password input value on typing', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'secret123');
      expect(passwordInput).toHaveValue('secret123');
    });

    it('does not show error message initially', () => {
      renderLoginPage();
      expect(screen.queryByText(/invalid username or password/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });

    it('clears error message on new submission attempt', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      // First failed attempt
      await user.type(screen.getByLabelText(/username/i), 'wrong');
      await user.type(screen.getByLabelText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });

      // Clear and try admin login
      await user.clear(screen.getByLabelText(/username/i));
      await user.clear(screen.getByLabelText(/password/i));
      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/password/i), 'admin');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard Page')).toBeInTheDocument();
      });
    });
  });
});