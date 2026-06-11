import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Home } from './Home.jsx';

/**
 * Helper to render Home within a MemoryRouter at /dashboard.
 * Requires a valid session in localStorage before calling.
 * @returns {Object} The render result.
 */
function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Home />
    </MemoryRouter>
  );
}

/**
 * Sets up a default user session in localStorage.
 * @param {Object} [overrides] - Optional session field overrides.
 */
function setSession(overrides = {}) {
  const session = {
    username: 'testuser',
    userId: 'user-1',
    role: 'user',
    loggedInAt: new Date().toISOString(),
    ...overrides,
  };
  localStorage.setItem('writespace_session', JSON.stringify(session));
}

describe('Home page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------- Page rendering ---------------

  describe('page rendering', () => {
    it('renders the "All Blog Posts" heading', () => {
      setSession();
      renderHome();
      expect(screen.getByText(/all blog posts/i)).toBeInTheDocument();
    });

    it('renders the description text', () => {
      setSession();
      renderHome();
      expect(screen.getByText(/browse and discover posts from the community/i)).toBeInTheDocument();
    });

    it('renders the "Write New Post" button', () => {
      setSession();
      renderHome();
      const buttons = screen.getAllByRole('button', { name: /write new post/i });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // --------------- Empty state ---------------

  describe('empty state', () => {
    it('displays empty state message when no posts exist', () => {
      setSession();
      renderHome();
      expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
    });

    it('displays encouragement text in empty state', () => {
      setSession();
      renderHome();
      expect(screen.getByText(/be the first to share your thoughts/i)).toBeInTheDocument();
    });

    it('displays a Write New Post button in empty state', () => {
      setSession();
      renderHome();
      const buttons = screen.getAllByRole('button', { name: /write new post/i });
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  // --------------- Posts rendering ---------------

  describe('posts rendering', () => {
    it('renders posts when they exist in localStorage', () => {
      setSession();
      const posts = [
        {
          id: 'post-1',
          title: 'First Post Title',
          content: 'Content of the first post',
          author: 'alice',
          authorRole: 'user',
          userId: 'user-2',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();
      expect(screen.getByText('First Post Title')).toBeInTheDocument();
    });

    it('renders multiple posts', () => {
      setSession();
      const posts = [
        {
          id: 'post-1',
          title: 'Post Alpha',
          content: 'Alpha content',
          author: 'alice',
          authorRole: 'user',
          userId: 'user-2',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'post-2',
          title: 'Post Beta',
          content: 'Beta content',
          author: 'bob',
          authorRole: 'user',
          userId: 'user-3',
          createdAt: '2024-06-02T00:00:00.000Z',
          updatedAt: '2024-06-02T00:00:00.000Z',
        },
        {
          id: 'post-3',
          title: 'Post Gamma',
          content: 'Gamma content',
          author: 'charlie',
          authorRole: 'user',
          userId: 'user-4',
          createdAt: '2024-06-03T00:00:00.000Z',
          updatedAt: '2024-06-03T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();
      expect(screen.getByText('Post Alpha')).toBeInTheDocument();
      expect(screen.getByText('Post Beta')).toBeInTheDocument();
      expect(screen.getByText('Post Gamma')).toBeInTheDocument();
    });

    it('renders posts sorted by newest first', () => {
      setSession();
      const posts = [
        {
          id: 'post-old',
          title: 'Old Post',
          content: 'Old content',
          author: 'alice',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'post-new',
          title: 'New Post',
          content: 'New content',
          author: 'bob',
          createdAt: '2024-06-15T00:00:00.000Z',
          updatedAt: '2024-06-15T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();

      const oldPost = screen.getByText('Old Post');
      const newPost = screen.getByText('New Post');
      expect(oldPost).toBeInTheDocument();
      expect(newPost).toBeInTheDocument();
    });

    it('displays post author names', () => {
      setSession();
      const posts = [
        {
          id: 'post-1',
          title: 'Author Test',
          content: 'Content here',
          author: 'authorname',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();
      expect(screen.getByText('authorname')).toBeInTheDocument();
    });

    it('displays "Anonymous" for posts without author', () => {
      setSession();
      const posts = [
        {
          id: 'post-1',
          title: 'No Author Post',
          content: 'Content without author',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });

    it('does not show empty state when posts exist', () => {
      setSession();
      const posts = [
        {
          id: 'post-1',
          title: 'Exists',
          content: 'Content',
          author: 'writer',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();
      expect(screen.queryByText(/no posts yet/i)).not.toBeInTheDocument();
    });
  });

  // --------------- Edit/Delete buttons based on ownership ---------------

  describe('edit/delete buttons based on ownership', () => {
    it('shows edit and delete buttons for posts owned by the current user', () => {
      setSession({ username: 'testuser', userId: 'user-1' });
      const posts = [
        {
          id: 'post-1',
          title: 'My Post',
          content: 'My content',
          author: 'testuser',
          authorRole: 'user',
          userId: 'user-1',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();

      expect(screen.getByRole('button', { name: /edit post: my post/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete post: my post/i })).toBeInTheDocument();
    });

    it('does not show edit and delete buttons for posts owned by other users', () => {
      setSession({ username: 'testuser', userId: 'user-1', role: 'user' });
      const posts = [
        {
          id: 'post-1',
          title: 'Other Post',
          content: 'Other content',
          author: 'otheruser',
          authorRole: 'user',
          userId: 'user-2',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();

      expect(screen.queryByRole('button', { name: /edit post: other post/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete post: other post/i })).not.toBeInTheDocument();
    });

    it('shows edit and delete buttons for all posts when user is admin', () => {
      setSession({ username: 'admin', role: 'admin' });
      const posts = [
        {
          id: 'post-1',
          title: 'Someone Else Post',
          content: 'Content by someone else',
          author: 'otheruser',
          authorRole: 'user',
          userId: 'user-2',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();

      expect(screen.getByRole('button', { name: /edit post: someone else post/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete post: someone else post/i })).toBeInTheDocument();
    });

    it('shows edit/delete for own post and not for others when user is regular', () => {
      setSession({ username: 'testuser', userId: 'user-1', role: 'user' });
      const posts = [
        {
          id: 'post-1',
          title: 'My Own Post',
          content: 'My own content',
          author: 'testuser',
          authorRole: 'user',
          userId: 'user-1',
          createdAt: '2024-06-02T00:00:00.000Z',
          updatedAt: '2024-06-02T00:00:00.000Z',
        },
        {
          id: 'post-2',
          title: 'Not My Post',
          content: 'Not my content',
          author: 'anotheruser',
          authorRole: 'user',
          userId: 'user-5',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();

      expect(screen.getByRole('button', { name: /edit post: my own post/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete post: my own post/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit post: not my post/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete post: not my post/i })).not.toBeInTheDocument();
    });
  });

  // --------------- Delete post interaction ---------------

  describe('delete post interaction', () => {
    it('removes a post from the list when delete is confirmed', async () => {
      setSession({ username: 'testuser', userId: 'user-1' });
      const posts = [
        {
          id: 'post-1',
          title: 'Post To Delete',
          content: 'Will be deleted',
          author: 'testuser',
          authorRole: 'user',
          userId: 'user-1',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      const user = userEvent.setup();
      renderHome();

      expect(screen.getByText('Post To Delete')).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: /delete post: post to delete/i });
      await user.click(deleteButton);

      expect(screen.queryByText('Post To Delete')).not.toBeInTheDocument();
      expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
    });

    it('does not remove a post when delete is cancelled', async () => {
      setSession({ username: 'testuser', userId: 'user-1' });
      const posts = [
        {
          id: 'post-1',
          title: 'Post To Keep',
          content: 'Will not be deleted',
          author: 'testuser',
          authorRole: 'user',
          userId: 'user-1',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));

      vi.spyOn(window, 'confirm').mockReturnValue(false);

      const user = userEvent.setup();
      renderHome();

      const deleteButton = screen.getByRole('button', { name: /delete post: post to keep/i });
      await user.click(deleteButton);

      expect(screen.getByText('Post To Keep')).toBeInTheDocument();
    });

    it('calls window.confirm when delete button is clicked', async () => {
      setSession({ username: 'testuser', userId: 'user-1' });
      const posts = [
        {
          id: 'post-1',
          title: 'Confirm Test',
          content: 'Content',
          author: 'testuser',
          authorRole: 'user',
          userId: 'user-1',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      const user = userEvent.setup();
      renderHome();

      const deleteButton = screen.getByRole('button', { name: /delete post: confirm test/i });
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });
  });

  // --------------- Navbar rendering ---------------

  describe('navbar rendering', () => {
    it('renders the Navbar with WriteSpace branding', () => {
      setSession();
      renderHome();
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
    });

    it('renders the Blogs link in the navbar', () => {
      setSession();
      renderHome();
      expect(screen.getByRole('link', { name: /blogs/i })).toBeInTheDocument();
    });

    it('renders the Logout button in the navbar', () => {
      setSession();
      renderHome();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('displays the username in the navbar', () => {
      setSession({ username: 'displayeduser' });
      renderHome();
      expect(screen.getByText('displayeduser')).toBeInTheDocument();
    });

    it('does not show admin links for regular users', () => {
      setSession({ username: 'regularuser', role: 'user' });
      renderHome();
      expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^users$/i })).not.toBeInTheDocument();
    });

    it('shows admin links for admin users', () => {
      setSession({ username: 'admin', role: 'admin' });
      renderHome();
      expect(screen.getByRole('link', { name: /admin dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument();
    });
  });

  // --------------- Content truncation ---------------

  describe('content truncation', () => {
    it('truncates long post content in the card preview', () => {
      setSession();
      const longContent = 'B'.repeat(200);
      const posts = [
        {
          id: 'post-1',
          title: 'Long Content Post',
          content: longContent,
          author: 'writer',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();

      expect(screen.queryByText(longContent)).not.toBeInTheDocument();
      const truncatedText = screen.getByText(/B{10,}…/);
      expect(truncatedText).toBeInTheDocument();
    });

    it('does not truncate short post content', () => {
      setSession();
      const shortContent = 'Short content here.';
      const posts = [
        {
          id: 'post-1',
          title: 'Short Content Post',
          content: shortContent,
          author: 'writer',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      renderHome();

      expect(screen.getByText(shortContent)).toBeInTheDocument();
    });
  });
});