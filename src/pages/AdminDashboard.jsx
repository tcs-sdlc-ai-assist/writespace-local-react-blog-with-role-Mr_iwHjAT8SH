import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { BlogCard } from '../components/BlogCard.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, getUsers, deletePost } from '../utils/storage.js';

/**
 * Admin dashboard page component.
 * Displays gradient header with welcome message, stat cards,
 * quick action buttons, and recent posts with edit/delete controls.
 * Accessible only to admin users (protected via ProtectedRoute).
 *
 * @returns {JSX.Element}
 */
export function AdminDashboard() {
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

  const users = getUsers();

  const totalPosts = posts.length;
  const totalUsers = users.length + 1; // +1 for hard-coded admin
  const adminCount = users.filter((u) => u.role === 'admin').length + 1; // +1 for hard-coded admin
  const userCount = users.filter((u) => u.role !== 'admin').length;

  const recentPosts = posts.slice(0, 5);

  const displayName = session?.displayName || session?.username || 'Admin';

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

      {/* Gradient Header */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {displayName} 👋
          </h1>
          <p className="mt-2 text-indigo-200 text-sm sm:text-base">
            Here&apos;s an overview of your WriteSpace platform.
          </p>
        </div>
      </section>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Posts"
            value={totalPosts}
            icon="📝"
            accent="indigo"
          />
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon="👥"
            accent="violet"
          />
          <StatCard
            label="Admins"
            value={adminCount}
            icon="👑"
            accent="amber"
          />
          <StatCard
            label="Users"
            value={userCount}
            icon="📖"
            accent="emerald"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <span>✍️</span>
            Write New Post
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
          >
            <span>👥</span>
            Manage Users
          </button>
        </div>

        {/* Recent Posts */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Recent Posts
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                The latest 5 posts on the platform.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              View All
            </button>
          </div>

          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 px-6 text-center shadow-sm">
              <span className="text-5xl mb-4">📝</span>
              <h2 className="text-xl font-bold text-gray-900">
                No posts yet
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                Get started by creating the first blog post on the platform.
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
              {recentPosts.map((post, index) => (
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
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;