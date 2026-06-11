import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App.jsx';

/**
 * Helper to render App within a MemoryRouter at a given route.
 * @param {string} initialRoute - The initial route to render.
 * @returns {Object} The render result.
 */
function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
}

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------- Public routes ---------------

  describe('public routes', () => {
    it('renders LandingPage at "/"', () => {
      renderApp('/');
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
      expect(screen.getByText(/Your space to write, share, and discover/i)).toBeInTheDocument();
    });

    it('renders LoginPage at "/login"', () => {
      renderApp('/login');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders RegisterPage at "/register"', () => {
      renderApp('/register');
      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    });
  });

  // --------------- Protected routes redirect unauthenticated users ---------------

  describe('protected routes redirect unauthenticated users', () => {
    it('redirects /dashboard to /login when not authenticated', () => {
      renderApp('/dashboard');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('redirects /create to /login when not authenticated', () => {
      renderApp('/create');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('redirects /edit/some-id to /login when not authenticated', () => {
      renderApp('/edit/some-id');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('redirects /read/some-id to /login when not authenticated', () => {
      renderApp('/read/some-id');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('redirects /admin to /login when not authenticated', () => {
      renderApp('/admin');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('redirects /admin/users to /login when not authenticated', () => {
      renderApp('/admin/users');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
  });

  // --------------- Protected routes render for authenticated users ---------------

  describe('protected routes render for authenticated users', () => {
    beforeEach(() => {
      const session = {
        username: 'testuser',
        userId: 'user-1',
        role: 'user',
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));
    });

    it('renders Home at /dashboard for authenticated user', () => {
      renderApp('/dashboard');
      expect(screen.getByText(/all blog posts/i)).toBeInTheDocument();
    });

    it('renders WriteBlog at /create for authenticated user', () => {
      renderApp('/create');
      expect(screen.getByText(/write new post/i)).toBeInTheDocument();
    });

    it('renders ReadBlog at /read/nonexistent with not found message', () => {
      renderApp('/read/nonexistent');
      expect(screen.getByText(/post not found/i)).toBeInTheDocument();
    });

    it('renders WriteBlog at /edit/nonexistent with not found message', () => {
      renderApp('/edit/nonexistent');
      expect(screen.getByText(/post not found/i)).toBeInTheDocument();
    });
  });

  // --------------- Admin routes redirect non-admin users ---------------

  describe('admin routes redirect non-admin users', () => {
    beforeEach(() => {
      const session = {
        username: 'regularuser',
        userId: 'user-2',
        role: 'user',
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));
    });

    it('redirects /admin to /dashboard for non-admin user', () => {
      renderApp('/admin');
      expect(screen.getByText(/all blog posts/i)).toBeInTheDocument();
    });

    it('redirects /admin/users to /dashboard for non-admin user', () => {
      renderApp('/admin/users');
      expect(screen.getByText(/all blog posts/i)).toBeInTheDocument();
    });
  });

  // --------------- Admin routes render for admin users ---------------

  describe('admin routes render for admin users', () => {
    beforeEach(() => {
      const session = {
        username: 'admin',
        role: 'admin',
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));
    });

    it('renders AdminDashboard at /admin for admin user', () => {
      renderApp('/admin');
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('renders UserManagement at /admin/users for admin user', () => {
      renderApp('/admin/users');
      expect(screen.getByText(/user management/i)).toBeInTheDocument();
    });
  });

  // --------------- Catch-all redirect ---------------

  describe('catch-all redirect', () => {
    it('redirects unknown routes to "/" (LandingPage)', () => {
      renderApp('/some/unknown/route');
      expect(screen.getByText(/Your space to write, share, and discover/i)).toBeInTheDocument();
    });

    it('redirects another unknown route to "/"', () => {
      renderApp('/nonexistent');
      expect(screen.getByText(/Your space to write, share, and discover/i)).toBeInTheDocument();
    });
  });

  // --------------- Navigation between pages ---------------

  describe('navigation between pages', () => {
    it('navigates from LandingPage to LoginPage via Login link', async () => {
      const user = userEvent.setup();
      renderApp('/');

      const loginLinks = screen.getAllByRole('link', { name: /login/i });
      expect(loginLinks.length).toBeGreaterThan(0);
      await user.click(loginLinks[0]);

      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('navigates from LoginPage to RegisterPage via Register link', async () => {
      const user = userEvent.setup();
      renderApp('/login');

      const registerLink = screen.getByRole('link', { name: /register/i });
      await user.click(registerLink);

      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    });

    it('navigates from RegisterPage to LoginPage via Login link', async () => {
      const user = userEvent.setup();
      renderApp('/register');

      const loginLink = screen.getByRole('link', { name: /login/i });
      await user.click(loginLink);

      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
  });
});