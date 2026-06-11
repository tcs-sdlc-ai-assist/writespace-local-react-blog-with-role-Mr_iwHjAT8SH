import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSession,
  setSession,
  clearSession,
  isAuthenticated,
  isAdmin,
  login,
  register,
} from './auth.js';

describe('auth utility module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------- getSession ---------------

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns stored session data', () => {
      const mockSession = { username: 'admin', role: 'admin', loggedInAt: '2024-01-01T00:00:00.000Z' };
      localStorage.setItem('writespace_session', JSON.stringify(mockSession));
      const session = getSession();
      expect(session).toEqual(mockSession);
    });

    it('returns null when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_session', 'not-valid-json');
      const session = getSession();
      expect(session).toBeNull();
    });
  });

  // --------------- setSession ---------------

  describe('setSession', () => {
    it('stores session data in localStorage', () => {
      const sessionData = { username: 'testuser', role: 'user', loggedInAt: '2024-06-01T00:00:00.000Z' };
      setSession(sessionData);
      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual(sessionData);
    });

    it('overwrites existing session data', () => {
      setSession({ username: 'first', role: 'user' });
      setSession({ username: 'second', role: 'admin' });
      const session = getSession();
      expect(session.username).toBe('second');
      expect(session.role).toBe('admin');
    });
  });

  // --------------- clearSession ---------------

  describe('clearSession', () => {
    it('removes session data from localStorage', () => {
      setSession({ username: 'testuser', role: 'user' });
      clearSession();
      const session = getSession();
      expect(session).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });
  });

  // --------------- isAuthenticated ---------------

  describe('isAuthenticated', () => {
    it('returns false when no session exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when a valid session exists', () => {
      setSession({ username: 'testuser', role: 'user' });
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when session has no username', () => {
      setSession({ role: 'user' });
      expect(isAuthenticated()).toBe(false);
    });

    it('returns false when session has empty username', () => {
      setSession({ username: '', role: 'user' });
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true for admin session', () => {
      setSession({ username: 'admin', role: 'admin' });
      expect(isAuthenticated()).toBe(true);
    });
  });

  // --------------- isAdmin ---------------

  describe('isAdmin', () => {
    it('returns false when no session exists', () => {
      expect(isAdmin()).toBe(false);
    });

    it('returns false for a regular user session', () => {
      setSession({ username: 'testuser', role: 'user' });
      expect(isAdmin()).toBe(false);
    });

    it('returns true for an admin session', () => {
      setSession({ username: 'admin', role: 'admin' });
      expect(isAdmin()).toBe(true);
    });

    it('returns false when session is invalid', () => {
      localStorage.setItem('writespace_session', 'broken');
      expect(isAdmin()).toBe(false);
    });
  });

  // --------------- login ---------------

  describe('login', () => {
    describe('hard-coded admin credentials', () => {
      it('succeeds with correct admin credentials', () => {
        const result = login('admin', 'admin');
        expect(result.success).toBe(true);
        expect(result.session).toBeDefined();
        expect(result.session.username).toBe('admin');
        expect(result.session.role).toBe('admin');
        expect(result.session).toHaveProperty('loggedInAt');
      });

      it('creates a session in localStorage on admin login', () => {
        login('admin', 'admin');
        const session = getSession();
        expect(session).not.toBeNull();
        expect(session.username).toBe('admin');
        expect(session.role).toBe('admin');
      });

      it('fails with correct admin username but wrong password', () => {
        const result = login('admin', 'wrongpassword');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('localStorage users', () => {
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
          {
            id: 'user-2',
            username: 'bob',
            password: 'bobpass',
            displayName: 'Bob',
            role: 'admin',
            createdAt: '2024-01-02T00:00:00.000Z',
          },
        ];
        localStorage.setItem('writespace_users', JSON.stringify(users));
      });

      it('succeeds with correct user credentials', () => {
        const result = login('alice', 'alicepass');
        expect(result.success).toBe(true);
        expect(result.session).toBeDefined();
        expect(result.session.username).toBe('alice');
        expect(result.session.role).toBe('user');
        expect(result.session.userId).toBe('user-1');
        expect(result.session).toHaveProperty('loggedInAt');
      });

      it('creates a session in localStorage on user login', () => {
        login('alice', 'alicepass');
        const session = getSession();
        expect(session).not.toBeNull();
        expect(session.username).toBe('alice');
        expect(session.userId).toBe('user-1');
      });

      it('succeeds with admin-role localStorage user', () => {
        const result = login('bob', 'bobpass');
        expect(result.success).toBe(true);
        expect(result.session.username).toBe('bob');
        expect(result.session.role).toBe('admin');
        expect(result.session.userId).toBe('user-2');
      });

      it('fails with correct username but wrong password', () => {
        const result = login('alice', 'wrongpassword');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid username or password.');
      });

      it('fails with nonexistent username', () => {
        const result = login('charlie', 'anypassword');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid username or password.');
      });
    });

    describe('validation', () => {
      it('fails when username is empty', () => {
        const result = login('', 'password');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when username is only whitespace', () => {
        const result = login('   ', 'password');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when password is empty', () => {
        const result = login('admin', '');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });

      it('fails when password is only whitespace', () => {
        const result = login('admin', '   ');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });

      it('fails when username is null', () => {
        const result = login(null, 'password');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when password is null', () => {
        const result = login('admin', null);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });

      it('fails when username is undefined', () => {
        const result = login(undefined, 'password');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when password is undefined', () => {
        const result = login('admin', undefined);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });
    });

    describe('trimming', () => {
      it('trims whitespace from username for admin login', () => {
        const result = login('  admin  ', 'admin');
        expect(result.success).toBe(true);
        expect(result.session.username).toBe('admin');
      });

      it('trims whitespace from password for admin login', () => {
        const result = login('admin', '  admin  ');
        expect(result.success).toBe(true);
        expect(result.session.username).toBe('admin');
      });

      it('trims whitespace from username for user login', () => {
        const users = [
          { id: 'u1', username: 'alice', password: 'pass', displayName: 'Alice', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' },
        ];
        localStorage.setItem('writespace_users', JSON.stringify(users));
        const result = login('  alice  ', 'pass');
        expect(result.success).toBe(true);
        expect(result.session.username).toBe('alice');
      });
    });
  });

  // --------------- register ---------------

  describe('register', () => {
    describe('successful registration', () => {
      it('registers a new user and returns success', () => {
        const result = register({ username: 'newuser', password: 'secret', displayName: 'New User' });
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.session).toBeDefined();
        expect(result.user.username).toBe('newuser');
        expect(result.user.displayName).toBe('New User');
        expect(result.user.role).toBe('user');
        expect(result.user).toHaveProperty('id');
        expect(result.user).toHaveProperty('createdAt');
      });

      it('creates a session after registration', () => {
        register({ username: 'newuser', password: 'secret' });
        const session = getSession();
        expect(session).not.toBeNull();
        expect(session.username).toBe('newuser');
        expect(session.role).toBe('user');
        expect(session).toHaveProperty('userId');
        expect(session).toHaveProperty('loggedInAt');
      });

      it('persists the user to localStorage', () => {
        register({ username: 'newuser', password: 'secret', displayName: 'New User' });
        const stored = JSON.parse(localStorage.getItem('writespace_users'));
        expect(stored).toHaveLength(1);
        expect(stored[0].username).toBe('newuser');
      });

      it('uses username as displayName when displayName is not provided', () => {
        const result = register({ username: 'newuser', password: 'secret' });
        expect(result.user.displayName).toBe('newuser');
      });

      it('trims username and password', () => {
        const result = register({ username: '  newuser  ', password: '  secret  ' });
        expect(result.success).toBe(true);
        expect(result.user.username).toBe('newuser');
        expect(result.user.password).toBe('secret');
      });

      it('trims displayName', () => {
        const result = register({ username: 'newuser', password: 'secret', displayName: '  My Name  ' });
        expect(result.user.displayName).toBe('My Name');
      });

      it('session userId matches user id', () => {
        const result = register({ username: 'newuser', password: 'secret' });
        expect(result.session.userId).toBe(result.user.id);
      });
    });

    describe('validation', () => {
      it('fails when username is empty', () => {
        const result = register({ username: '', password: 'secret' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when username is only whitespace', () => {
        const result = register({ username: '   ', password: 'secret' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when password is empty', () => {
        const result = register({ username: 'newuser', password: '' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });

      it('fails when password is only whitespace', () => {
        const result = register({ username: 'newuser', password: '   ' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });

      it('fails when username is null', () => {
        const result = register({ username: null, password: 'secret' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when password is null', () => {
        const result = register({ username: 'newuser', password: null });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });

      it('fails when username is undefined', () => {
        const result = register({ password: 'secret' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when password is undefined', () => {
        const result = register({ username: 'newuser' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password is required.');
      });

      it('fails when no arguments are provided', () => {
        const result = register();
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is required.');
      });

      it('fails when username is less than 3 characters', () => {
        const result = register({ username: 'ab', password: 'secret' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username must be at least 3 characters.');
      });

      it('fails when password is less than 3 characters', () => {
        const result = register({ username: 'newuser', password: 'ab' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Password must be at least 3 characters.');
      });
    });

    describe('uniqueness', () => {
      it('fails when username is "admin" (hard-coded admin)', () => {
        const result = register({ username: 'admin', password: 'secret' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is already taken.');
      });

      it('fails when username already exists in localStorage', () => {
        register({ username: 'alice', password: 'secret' });
        const result = register({ username: 'alice', password: 'othersecret' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username is already taken.');
      });

      it('allows different usernames', () => {
        const result1 = register({ username: 'alice', password: 'secret' });
        const result2 = register({ username: 'bob', password: 'secret' });
        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
      });
    });

    describe('role assignment', () => {
      it('always assigns user role on registration', () => {
        const result = register({ username: 'newuser', password: 'secret' });
        expect(result.user.role).toBe('user');
        expect(result.session.role).toBe('user');
      });
    });
  });

  // --------------- login then session checks ---------------

  describe('login and session integration', () => {
    it('isAuthenticated returns true after successful login', () => {
      login('admin', 'admin');
      expect(isAuthenticated()).toBe(true);
    });

    it('isAdmin returns true after admin login', () => {
      login('admin', 'admin');
      expect(isAdmin()).toBe(true);
    });

    it('isAdmin returns false after regular user login', () => {
      const users = [
        { id: 'u1', username: 'alice', password: 'pass', displayName: 'Alice', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));
      login('alice', 'pass');
      expect(isAdmin()).toBe(false);
    });

    it('isAuthenticated returns false after clearSession', () => {
      login('admin', 'admin');
      clearSession();
      expect(isAuthenticated()).toBe(false);
    });

    it('isAdmin returns false after clearSession', () => {
      login('admin', 'admin');
      clearSession();
      expect(isAdmin()).toBe(false);
    });
  });

  // --------------- register then session checks ---------------

  describe('register and session integration', () => {
    it('isAuthenticated returns true after successful registration', () => {
      register({ username: 'newuser', password: 'secret' });
      expect(isAuthenticated()).toBe(true);
    });

    it('isAdmin returns false after registration (users are never admin)', () => {
      register({ username: 'newuser', password: 'secret' });
      expect(isAdmin()).toBe(false);
    });

    it('can login with registered user credentials', () => {
      register({ username: 'newuser', password: 'secret' });
      clearSession();
      const result = login('newuser', 'secret');
      expect(result.success).toBe(true);
      expect(result.session.username).toBe('newuser');
    });
  });
});