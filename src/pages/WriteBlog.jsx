import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { getSession } from '../utils/auth.js';
import { getPostById, addPost, updatePost } from '../utils/storage.js';

/**
 * Determines whether the current session user can edit the given post.
 * @param {Object|null} session - The current session object.
 * @param {Object} post - The post object.
 * @returns {boolean} True if the user owns the post or is an admin.
 */
function canModify(session, post) {
  if (!session) return false;
  if (session.role === 'admin') return true;
  if (session.username && post.author === session.username) return true;
  if (session.userId && post.userId === session.userId) return true;
  return false;
}

/**
 * Blog create/edit page component.
 * At '/create' for creating new posts; at '/edit/:id' for editing existing posts.
 * Form with title and content fields (both required).
 * On create: saves post with author info from session.
 * On edit: loads existing post, enforces ownership (user must be owner or admin), updates post.
 * Redirects to '/dashboard' on success. Uses Navbar.
 *
 * @returns {JSX.Element}
 */
export function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const existingPost = getPostById(id);
      if (!existingPost) {
        setNotFound(true);
        return;
      }
      if (!canModify(session, existingPost)) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setTitle(existingPost.title);
      setContent(existingPost.content);
    }
  }, [id, isEditMode, session, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        const result = updatePost(id, {
          title: title.trim(),
          content: content.trim(),
        });
        if (!result) {
          setError('Failed to update post. Post may have been deleted.');
          setLoading(false);
          return;
        }
      } else {
        addPost({
          title: title.trim(),
          content: content.trim(),
          author: session?.displayName || session?.username || 'Anonymous',
          authorRole: session?.role || 'user',
          userId: session?.userId || '',
        });
      }

      navigate('/dashboard', { replace: true });
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar session={session} />
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 px-6 text-center shadow-sm">
            <span className="text-5xl mb-4">🔍</span>
            <h2 className="text-xl font-bold text-gray-900">
              Post Not Found
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md">
              The blog post you&apos;re trying to edit doesn&apos;t exist or may have been deleted.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Browse All Posts
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors mb-6"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back to Blogs
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {isEditMode ? 'Edit Post' : 'Write New Post'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? 'Update your blog post below.'
              : 'Share your thoughts with the community.'}
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="Enter your post title"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-y"
                placeholder="Write your blog post content here..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                  loading
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:bg-indigo-700'
                }`}
              >
                {loading
                  ? isEditMode
                    ? 'Updating…'
                    : 'Publishing…'
                  : isEditMode
                    ? 'Update Post'
                    : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default WriteBlog;