import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { BlogCard } from '../components/BlogCard.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, deletePost } from '../utils/storage.js';

/**
 * Blog list page for authenticated users.
 * Displays all posts from localStorage in a responsive grid.
 * Each post rendered as BlogCard with ownership-aware edit/delete controls.
 * Includes 'Write New Post' CTA button and empty state message.
 *
 * @returns {JSX.Element}
 */
export function Home() {
  const navigate = useNavigate();
  const session = getSession();
  const [posts, setPosts] = useState(() => {
    const allPosts = getPosts();
    return [...allPosts].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  });

  const handleEdit = useCallback(
    (post) => {
      navigate(`/edit/${post.id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (postId) => {
      const confirmed = window.confirm('Are you sure you want to delete this post?');
      if (!confirmed) return;

      const success = deletePost(postId);
      if (success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              All Blog Posts
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and discover posts from the community.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <span>✍️</span>
            Write New Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 px-6 text-center shadow-sm">
            <span className="text-5xl mb-4">📝</span>
            <h2 className="text-xl font-bold text-gray-900">
              No posts yet
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md">
              Be the first to share your thoughts! Click the button above to write your first blog post.
            </p>
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <span>✍️</span>
              Write New Post
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                index={index}
                session={session}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;