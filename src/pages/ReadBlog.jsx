import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { getSession } from '../utils/auth.js';
import { getPostById, deletePost } from '../utils/storage.js';

/**
 * Formats an ISO date string into a human-readable format.
 * @param {string} isoString - ISO 8601 date string.
 * @returns {string} Formatted date string.
 */
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Determines whether the current session user can edit/delete the given post.
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
 * Single blog post read view page component.
 * Displays full post title, content, author name with Avatar, and creation date.
 * Shows edit/delete buttons if user is owner or admin.
 * Includes back to blogs link. Uses Navbar.
 * Handles post not found with error message.
 *
 * @returns {JSX.Element}
 */
export function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [post, setPost] = useState(() => getPostById(id));

  const showActions = post ? canModify(session, post) : false;
  const authorRole = post?.authorRole || 'user';

  const handleEdit = useCallback(() => {
    if (post) {
      navigate(`/edit/${post.id}`);
    }
  }, [navigate, post]);

  const handleDelete = useCallback(() => {
    if (!post) return;
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    const success = deletePost(post.id);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, post]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
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
        </Link>

        {!post ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 px-6 text-center shadow-sm">
            <span className="text-5xl mb-4">🔍</span>
            <h2 className="text-xl font-bold text-gray-900">
              Post Not Found
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md">
              The blog post you&apos;re looking for doesn&apos;t exist or may have been deleted.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Browse All Posts
            </Link>
          </div>
        ) : (
          <article className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl leading-tight">
                {post.title}
              </h1>
              {showActions && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    aria-label={`Edit post: ${post.title}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label={`Delete post: ${post.title}`}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Avatar role={authorRole} size="md" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {post.author || 'Anonymous'}
                </span>
                {post.createdAt && (
                  <span className="text-xs text-gray-400">
                    {formatDate(post.createdAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

export default ReadBlog;