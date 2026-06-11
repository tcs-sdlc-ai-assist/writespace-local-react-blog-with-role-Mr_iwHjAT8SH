import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPosts,
  getPostById,
  addPost,
  updatePost,
  deletePost,
  getUsers,
  getUserByUsername,
  addUser,
  deleteUser,
  getSession,
  setSession,
  clearSession,
} from './storage.js';

describe('storage utility module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------- Posts ---------------

  describe('getPosts', () => {
    it('returns an empty array when no posts exist', () => {
      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('returns stored posts', () => {
      const mockPosts = [
        { id: '1', title: 'Test', content: 'Content', createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(mockPosts));
      const posts = getPosts();
      expect(posts).toEqual(mockPosts);
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_posts', 'not-json');
      const posts = getPosts();
      expect(posts).toEqual([]);
    });
  });

  describe('getPostById', () => {
    it('returns the post with the matching id', () => {
      const mockPosts = [
        { id: 'abc', title: 'First', content: 'Content 1' },
        { id: 'def', title: 'Second', content: 'Content 2' },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(mockPosts));
      const post = getPostById('def');
      expect(post).toEqual(mockPosts[1]);
    });

    it('returns undefined when no post matches the id', () => {
      const mockPosts = [{ id: 'abc', title: 'First', content: 'Content 1' }];
      localStorage.setItem('writespace_posts', JSON.stringify(mockPosts));
      const post = getPostById('nonexistent');
      expect(post).toBeUndefined();
    });

    it('returns undefined when no posts exist', () => {
      const post = getPostById('any-id');
      expect(post).toBeUndefined();
    });
  });

  describe('addPost', () => {
    it('creates a new post with generated id and timestamps', () => {
      const postData = {
        title: 'My Post',
        content: 'Some content',
        author: 'testuser',
        authorRole: 'user',
        userId: 'user-1',
      };
      const newPost = addPost(postData);

      expect(newPost).toHaveProperty('id');
      expect(typeof newPost.id).toBe('string');
      expect(newPost.id.length).toBeGreaterThan(0);
      expect(newPost.title).toBe('My Post');
      expect(newPost.content).toBe('Some content');
      expect(newPost.author).toBe('testuser');
      expect(newPost.authorRole).toBe('user');
      expect(newPost.userId).toBe('user-1');
      expect(newPost).toHaveProperty('createdAt');
      expect(newPost).toHaveProperty('updatedAt');
      expect(newPost.createdAt).toBe(newPost.updatedAt);
    });

    it('persists the post to localStorage', () => {
      addPost({ title: 'Persisted', content: 'Body' });
      const stored = JSON.parse(localStorage.getItem('writespace_posts'));
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('Persisted');
    });

    it('appends to existing posts', () => {
      addPost({ title: 'First', content: 'Body 1' });
      addPost({ title: 'Second', content: 'Body 2' });
      const posts = getPosts();
      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('First');
      expect(posts[1].title).toBe('Second');
    });

    it('generates unique ids for each post', () => {
      const post1 = addPost({ title: 'A', content: 'A' });
      const post2 = addPost({ title: 'B', content: 'B' });
      expect(post1.id).not.toBe(post2.id);
    });
  });

  describe('updatePost', () => {
    it('updates an existing post and returns the updated post', () => {
      const post = addPost({ title: 'Original', content: 'Original content' });
      const updated = updatePost(post.id, { title: 'Updated Title' });

      expect(updated).not.toBeNull();
      expect(updated.id).toBe(post.id);
      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Original content');
      expect(updated).toHaveProperty('updatedAt');
    });

    it('persists the update to localStorage', () => {
      const post = addPost({ title: 'Original', content: 'Body' });
      updatePost(post.id, { content: 'New body' });
      const stored = getPostById(post.id);
      expect(stored.content).toBe('New body');
    });

    it('returns null when post id does not exist', () => {
      const result = updatePost('nonexistent', { title: 'Nope' });
      expect(result).toBeNull();
    });

    it('does not allow overwriting the id field', () => {
      const post = addPost({ title: 'Test', content: 'Body' });
      const updated = updatePost(post.id, { id: 'hacked-id', title: 'Changed' });
      expect(updated.id).toBe(post.id);
    });

    it('sets a new updatedAt timestamp', () => {
      const post = addPost({ title: 'Test', content: 'Body' });
      const originalUpdatedAt = post.updatedAt;

      // Small delay to ensure different timestamp
      const updated = updatePost(post.id, { title: 'Changed' });
      expect(updated.updatedAt).toBeDefined();
      // updatedAt should be a valid ISO string
      expect(new Date(updated.updatedAt).toISOString()).toBe(updated.updatedAt);
    });
  });

  describe('deletePost', () => {
    it('deletes an existing post and returns true', () => {
      const post = addPost({ title: 'To Delete', content: 'Body' });
      const result = deletePost(post.id);
      expect(result).toBe(true);
      expect(getPosts()).toHaveLength(0);
    });

    it('returns false when post id does not exist', () => {
      addPost({ title: 'Keep', content: 'Body' });
      const result = deletePost('nonexistent');
      expect(result).toBe(false);
      expect(getPosts()).toHaveLength(1);
    });

    it('only removes the targeted post', () => {
      const post1 = addPost({ title: 'Keep', content: 'Body 1' });
      const post2 = addPost({ title: 'Delete', content: 'Body 2' });
      deletePost(post2.id);
      const remaining = getPosts();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(post1.id);
    });
  });

  // --------------- Users ---------------

  describe('getUsers', () => {
    it('returns an empty array when no users exist', () => {
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns stored users', () => {
      const mockUsers = [{ id: '1', username: 'alice', role: 'user' }];
      localStorage.setItem('writespace_users', JSON.stringify(mockUsers));
      const users = getUsers();
      expect(users).toEqual(mockUsers);
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_users', '{broken');
      const users = getUsers();
      expect(users).toEqual([]);
    });
  });

  describe('getUserByUsername', () => {
    it('returns the user with the matching username', () => {
      const user = addUser({ username: 'bob', password: 'pass', displayName: 'Bob', role: 'user' });
      const found = getUserByUsername('bob');
      expect(found).toBeDefined();
      expect(found.username).toBe('bob');
      expect(found.id).toBe(user.id);
    });

    it('returns undefined when no user matches', () => {
      addUser({ username: 'alice', password: 'pass', displayName: 'Alice', role: 'user' });
      const found = getUserByUsername('charlie');
      expect(found).toBeUndefined();
    });

    it('returns undefined when no users exist', () => {
      const found = getUserByUsername('anyone');
      expect(found).toBeUndefined();
    });
  });

  describe('addUser', () => {
    it('creates a new user with generated id and createdAt', () => {
      const userData = {
        username: 'newuser',
        password: 'secret',
        displayName: 'New User',
        role: 'user',
      };
      const newUser = addUser(userData);

      expect(newUser).toHaveProperty('id');
      expect(typeof newUser.id).toBe('string');
      expect(newUser.id.length).toBeGreaterThan(0);
      expect(newUser.username).toBe('newuser');
      expect(newUser.password).toBe('secret');
      expect(newUser.displayName).toBe('New User');
      expect(newUser.role).toBe('user');
      expect(newUser).toHaveProperty('createdAt');
      expect(new Date(newUser.createdAt).toISOString()).toBe(newUser.createdAt);
    });

    it('persists the user to localStorage', () => {
      addUser({ username: 'persisted', password: 'pass', displayName: 'P', role: 'user' });
      const stored = JSON.parse(localStorage.getItem('writespace_users'));
      expect(stored).toHaveLength(1);
      expect(stored[0].username).toBe('persisted');
    });

    it('appends to existing users', () => {
      addUser({ username: 'first', password: 'pass', displayName: 'First', role: 'user' });
      addUser({ username: 'second', password: 'pass', displayName: 'Second', role: 'admin' });
      const users = getUsers();
      expect(users).toHaveLength(2);
    });

    it('generates unique ids for each user', () => {
      const user1 = addUser({ username: 'u1', password: 'p', displayName: 'U1', role: 'user' });
      const user2 = addUser({ username: 'u2', password: 'p', displayName: 'U2', role: 'user' });
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('deleteUser', () => {
    it('deletes an existing user and returns true', () => {
      const user = addUser({ username: 'todelete', password: 'pass', displayName: 'TD', role: 'user' });
      const result = deleteUser(user.id);
      expect(result).toBe(true);
      expect(getUsers()).toHaveLength(0);
    });

    it('returns false when user id does not exist', () => {
      addUser({ username: 'keep', password: 'pass', displayName: 'K', role: 'user' });
      const result = deleteUser('nonexistent');
      expect(result).toBe(false);
      expect(getUsers()).toHaveLength(1);
    });

    it('only removes the targeted user', () => {
      const user1 = addUser({ username: 'keep', password: 'pass', displayName: 'Keep', role: 'user' });
      const user2 = addUser({ username: 'remove', password: 'pass', displayName: 'Remove', role: 'user' });
      deleteUser(user2.id);
      const remaining = getUsers();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(user1.id);
    });
  });

  // --------------- Session ---------------

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
      localStorage.setItem('writespace_session', 'invalid');
      const session = getSession();
      expect(session).toBeNull();
    });
  });

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

    it('does not affect other stored data', () => {
      addPost({ title: 'Survive', content: 'Body' });
      addUser({ username: 'survive', password: 'pass', displayName: 'S', role: 'user' });
      setSession({ username: 'testuser', role: 'user' });
      clearSession();

      expect(getSession()).toBeNull();
      expect(getPosts()).toHaveLength(1);
      expect(getUsers()).toHaveLength(1);
    });
  });

  // --------------- Fallback behavior ---------------

  describe('fallback behavior on localStorage errors', () => {
    it('getPosts returns empty array when getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('getUsers returns empty array when getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('getSession returns null when getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      const session = getSession();
      expect(session).toBeNull();
    });

    it('setSession does not throw when setItem throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      expect(() => setSession({ username: 'test' })).not.toThrow();
    });

    it('clearSession does not throw when removeItem throws', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      expect(() => clearSession()).not.toThrow();
    });

    it('addPost does not throw when setItem throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      expect(() => addPost({ title: 'Test', content: 'Body' })).not.toThrow();
    });

    it('addUser does not throw when setItem throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      expect(() => addUser({ username: 'test', password: 'pass', displayName: 'T', role: 'user' })).not.toThrow();
    });
  });

  // --------------- Data schema compliance ---------------

  describe('data schema compliance', () => {
    it('addPost returns object with correct schema', () => {
      const post = addPost({
        title: 'Schema Test',
        content: 'Content here',
        author: 'writer',
        authorRole: 'user',
        userId: 'uid-123',
      });

      expect(typeof post.id).toBe('string');
      expect(typeof post.title).toBe('string');
      expect(typeof post.content).toBe('string');
      expect(typeof post.author).toBe('string');
      expect(typeof post.authorRole).toBe('string');
      expect(typeof post.userId).toBe('string');
      expect(typeof post.createdAt).toBe('string');
      expect(typeof post.updatedAt).toBe('string');

      // Validate ISO date format
      expect(() => new Date(post.createdAt)).not.toThrow();
      expect(new Date(post.createdAt).toISOString()).toBe(post.createdAt);
    });

    it('addUser returns object with correct schema', () => {
      const user = addUser({
        username: 'schemauser',
        password: 'pass123',
        displayName: 'Schema User',
        role: 'admin',
      });

      expect(typeof user.id).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(typeof user.password).toBe('string');
      expect(typeof user.displayName).toBe('string');
      expect(typeof user.role).toBe('string');
      expect(typeof user.createdAt).toBe('string');

      // Validate ISO date format
      expect(() => new Date(user.createdAt)).not.toThrow();
      expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt);
    });

    it('updatePost preserves original fields not in updates', () => {
      const post = addPost({
        title: 'Original',
        content: 'Original content',
        author: 'writer',
        authorRole: 'user',
        userId: 'uid-1',
      });

      const updated = updatePost(post.id, { title: 'New Title' });
      expect(updated.content).toBe('Original content');
      expect(updated.author).toBe('writer');
      expect(updated.authorRole).toBe('user');
      expect(updated.userId).toBe('uid-1');
      expect(updated.createdAt).toBe(post.createdAt);
    });
  });
});