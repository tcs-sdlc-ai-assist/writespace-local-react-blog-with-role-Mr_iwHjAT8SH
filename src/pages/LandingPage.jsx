import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts } from '../utils/storage.js';

const FEATURES = [
  {
    icon: '✍️',
    title: 'Write & Publish',
    description:
      'Create and publish blog posts instantly. No setup, no backend — just start writing and share your ideas with the world.',
  },
  {
    icon: '👥',
    title: 'Community Driven',
    description:
      'Join a growing community of writers. Browse posts from other authors, discover new perspectives, and get inspired.',
  },
  {
    icon: '🔒',
    title: 'Role-Based Access',
    description:
      'Secure role-based system with admin and user roles. Admins manage content and users, while writers focus on creating.',
  },
];

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
 * Truncates content to a given max length and appends ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} [maxLength=120] - Maximum character length.
 * @returns {string} Truncated text.
 */
function truncate(text, maxLength = 120) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Public landing page component.
 * Features a gradient hero section, feature cards, latest posts preview, and footer.
 * Uses PublicNavbar for navigation.
 *
 * @returns {JSX.Element}
 */
export function LandingPage() {
  const navigate = useNavigate();
  const session = getSession();

  const allPosts = getPosts();
  const latestPosts = [...allPosts]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  function handlePostClick() {
    if (session && session.username) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar session={session} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            WriteSpace
          </h1>
          <p className="mt-4 text-lg text-indigo-100 sm:text-xl lg:text-2xl max-w-2xl mx-auto">
            Your space to write, share, and discover amazing stories. A simple, beautiful blogging platform for everyone.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why WriteSpace?
            </h2>
            <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
              Everything you need to start your blogging journey, all in one place.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-2xl">
                  <span>{feature.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Preview */}
      {latestPosts.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Latest Posts
              </h2>
              <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
                See what our community has been writing about.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={handlePostClick}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-left shadow-sm hover:shadow-md transition-all hover:border-indigo-300 cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {truncate(post.content)}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {post.author || 'Anonymous'}
                    </span>
                    {post.createdAt && (
                      <span className="text-xs text-gray-400">
                        {formatDate(post.createdAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="WriteSpace logo">
                ✍️
              </span>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                WriteSpace
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Register
              </button>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;