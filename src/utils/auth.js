/**
 * Authentication and session utility module for WriteSpace.
 * Provides session management, role-checking, login, and registration functions.
 *
 * @module auth
 */

import {
  getSession as storageGetSession,
  setSession as storageSetSession,
  clearSession as storageClearSession,
  getUsers,
  getUserByUsername,
  addUser,
} from './storage.js';

/**
 * Hard-coded admin credentials.
 * @constant
 */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

/**
 * Retrieves the current session data from localStorage.
 * @returns {Object|null} The session object, or null if no session exists.
 */
export function getSession() {
  return storageGetSession();
}

/**
 * Saves session data to localStorage.
 * @param {Object} sessionData - The session data to store.
 */
export function setSession(sessionData) {
  storageSetSession(sessionData);
}

/**
 * Clears the current session from localStorage.
 */
export function clearSession() {
  storageClearSession();
}

/**
 * Checks whether a user is currently authenticated.
 * @returns {boolean} True if a valid session exists, false otherwise.
 */
export function isAuthenticated() {
  const session = getSession();
  return session !== null && typeof session === 'object' && Boolean(session.username);
}

/**
 * Checks whether the current session user has admin role.
 * @returns {boolean} True if the current user is an admin, false otherwise.
 */
export function isAdmin() {
  const session = getSession();
  if (!session || typeof session !== 'object') {
    return false;
  }
  return session.role === 'admin';
}

/**
 * Validates credentials against the hard-coded admin account and localStorage users.
 * On success, creates a session and returns the session object.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {{ success: boolean, session?: Object, error?: string }}
 */
export function login(username, password) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { success: false, error: 'Username is required.' };
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return { success: false, error: 'Password is required.' };
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  // Check hard-coded admin credentials
  if (trimmedUsername === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD) {
    const session = {
      username: ADMIN_USERNAME,
      role: 'admin',
      loggedInAt: new Date().toISOString(),
    };
    setSession(session);
    return { success: true, session };
  }

  // Check localStorage users
  const user = getUserByUsername(trimmedUsername);
  if (!user) {
    return { success: false, error: 'Invalid username or password.' };
  }

  if (user.password !== trimmedPassword) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const session = {
    userId: user.id,
    username: user.username,
    role: user.role || 'user',
    loggedInAt: new Date().toISOString(),
  };
  setSession(session);
  return { success: true, session };
}

/**
 * Registers a new user. Validates required fields and username uniqueness.
 * On success, saves the user to localStorage and creates a session.
 * @param {Object} params - Registration parameters.
 * @param {string} params.username - The desired username.
 * @param {string} params.password - The desired password.
 * @param {string} [params.displayName] - Optional display name.
 * @returns {{ success: boolean, user?: Object, session?: Object, error?: string }}
 */
export function register({ username, password, displayName } = {}) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { success: false, error: 'Username is required.' };
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return { success: false, error: 'Password is required.' };
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (trimmedUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }

  if (trimmedPassword.length < 3) {
    return { success: false, error: 'Password must be at least 3 characters.' };
  }

  // Prevent registering with the admin username
  if (trimmedUsername === ADMIN_USERNAME) {
    return { success: false, error: 'Username is already taken.' };
  }

  // Check uniqueness against existing users
  const existingUser = getUserByUsername(trimmedUsername);
  if (existingUser) {
    return { success: false, error: 'Username is already taken.' };
  }

  const user = addUser({
    username: trimmedUsername,
    password: trimmedPassword,
    displayName: displayName ? displayName.trim() : trimmedUsername,
    role: 'user',
  });

  const session = {
    userId: user.id,
    username: user.username,
    role: user.role,
    loggedInAt: new Date().toISOString(),
  };
  setSession(session);

  return { success: true, user, session };
}