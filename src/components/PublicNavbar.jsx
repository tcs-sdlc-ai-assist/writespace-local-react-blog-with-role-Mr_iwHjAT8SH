import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';

/**
 * Navigation bar for the public landing page.
 * Shows WriteSpace brand/logo.
 * For guests: Login and Get Started buttons.
 * For authenticated users: avatar with display name and dashboard CTA button.
 * Responsive with hamburger menu on mobile.
 *
 * @param {Object} props
 * @param {Object|null} [props.session=null] - The current user session.
 * @param {string} [props.session.username] - The username.
 * @param {string} [props.session.displayName] - The display name.
 * @param {string} [props.session.role] - The user role.
 * @returns {JSX.Element}
 */
export function PublicNavbar({ session = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = session !== null && typeof session === 'object' && Boolean(session.username);
  const displayName = session?.displayName || session?.username || '';
  const role = session?.role || 'user';
  const dashboardPath = role === 'admin' ? '/admin' : '/dashboard';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand / Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="WriteSpace logo">
                ✍️
              </span>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                WriteSpace
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2">
                  <Avatar role={role} size="sm" />
                  <span className="text-sm font-semibold text-gray-700">
                    {displayName}
                  </span>
                </div>
                <Link
                  to={dashboardPath}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-2 space-y-2">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 py-2">
                <Avatar role={role} size="sm" />
                <span className="text-sm font-semibold text-gray-700">
                  {displayName}
                </span>
              </div>
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

PublicNavbar.propTypes = {
  session: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    userId: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default PublicNavbar;