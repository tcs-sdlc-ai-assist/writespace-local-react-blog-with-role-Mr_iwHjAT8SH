/**
 * LocalStorage utility module for WriteSpace data persistence.
 * Provides CRUD functions for posts, users, and session data.
 *
 * @module storage
 */

const KEYS = {
  posts: 'writespace_posts',
  users: 'writespace_users',
  session: 'writespace_session',
};

/**
 * Safely reads and parses JSON from localStorage.
 * @param {string} key - The localStorage key to read.
 * @param {*} fallback - The fallback value if read fails.
 * @returns {*} Parsed value or fallback.
 */
function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Safely writes a value as JSON to localStorage.
 * @param {string} key - The localStorage key to write.
 * @param {*} value - The value to serialize and store.
 */
function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// --------------- Posts ---------------

/**
 * Retrieves all posts from localStorage.
 * @returns {Array<Object>} Array of post objects.
 */
export function getPosts() {
  return safeRead(KEYS.posts, []);
}

/**
 * Retrieves a single post by its ID.
 * @param {string} id - The post ID.
 * @returns {Object|undefined} The post object, or undefined if not found.
 */
export function getPostById(id) {
  const posts = getPosts();
  return posts.find((post) => post.id === id);
}

/**
 * Adds a new post to localStorage.
 * @param {Object} postData - The post data (without id/createdAt).
 * @returns {Object} The newly created post with generated id and timestamps.
 */
export function addPost(postData) {
  const posts = getPosts();
  const now = new Date().toISOString();
  const newPost = {
    id: crypto.randomUUID(),
    ...postData,
    createdAt: now,
    updatedAt: now,
  };
  posts.push(newPost);
  safeWrite(KEYS.posts, posts);
  return newPost;
}

/**
 * Updates an existing post by ID.
 * @param {string} id - The post ID to update.
 * @param {Object} updates - The fields to update.
 * @returns {Object|null} The updated post, or null if not found.
 */
export function updatePost(id, updates) {
  const posts = getPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) {
    return null;
  }
  const updatedPost = {
    ...posts[index],
    ...updates,
    id: posts[index].id,
    updatedAt: new Date().toISOString(),
  };
  posts[index] = updatedPost;
  safeWrite(KEYS.posts, posts);
  return updatedPost;
}

/**
 * Deletes a post by ID.
 * @param {string} id - The post ID to delete.
 * @returns {boolean} True if the post was found and deleted, false otherwise.
 */
export function deletePost(id) {
  const posts = getPosts();
  const filtered = posts.filter((post) => post.id !== id);
  if (filtered.length === posts.length) {
    return false;
  }
  safeWrite(KEYS.posts, filtered);
  return true;
}

// --------------- Users ---------------

/**
 * Retrieves all users from localStorage.
 * @returns {Array<Object>} Array of user objects.
 */
export function getUsers() {
  return safeRead(KEYS.users, []);
}

/**
 * Retrieves a single user by username.
 * @param {string} username - The username to search for.
 * @returns {Object|undefined} The user object, or undefined if not found.
 */
export function getUserByUsername(username) {
  const users = getUsers();
  return users.find((user) => user.username === username);
}

/**
 * Adds a new user to localStorage.
 * @param {Object} userData - The user data (without id/createdAt).
 * @returns {Object} The newly created user with generated id and timestamp.
 */
export function addUser(userData) {
  const users = getUsers();
  const newUser = {
    id: crypto.randomUUID(),
    ...userData,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  safeWrite(KEYS.users, users);
  return newUser;
}

/**
 * Deletes a user by ID.
 * @param {string} id - The user ID to delete.
 * @returns {boolean} True if the user was found and deleted, false otherwise.
 */
export function deleteUser(id) {
  const users = getUsers();
  const filtered = users.filter((user) => user.id !== id);
  if (filtered.length === users.length) {
    return false;
  }
  safeWrite(KEYS.users, filtered);
  return true;
}

// --------------- Session ---------------

/**
 * Retrieves the current session data from localStorage.
 * @returns {Object|null} The session object, or null if no session exists.
 */
export function getSession() {
  return safeRead(KEYS.session, null);
}

/**
 * Saves session data to localStorage.
 * @param {Object} sessionData - The session data to store.
 */
export function setSession(sessionData) {
  safeWrite(KEYS.session, sessionData);
}

/**
 * Clears the current session from localStorage.
 */
export function clearSession() {
  try {
    localStorage.removeItem(KEYS.session);
  } catch {
    // Storage unavailable — silently fail
  }
}