import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';
import { clearSession } from '../utils/auth.js';

/**
 * Navigation bar for authenticated pages.
 * White background with shadow and border-b.
 * Shows WriteSpace brand, navigation links (Blogs, and Admin Dashboard/Users for admins),
 * avatar with display name, and logout button.
 * Responsive with hamburger menu on mobile.
 * Logout clears session and redirects to '/'.
 *
 * @param {Object} props
 * @param {Object} props.session - The current user session.
 * @param {string} props.session.username - The username.
 * @param {string} [props.session.displayName] - The display name.
 * @param {string} [props.session.role] - The user role.
 * @returns {JSX.Element}
 */
export function Navbar({ session }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const displayName = session?.displayName || session?.username || '';
  const role = session?.role || 'user';
  const isAdmin = role === 'admin';

  function handleLogout() {
    clearSession();
    navigate('/');
  }

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
            <Link
              to="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Blogs
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Users
                </Link>
              </>
            )}
            <div className="flex items-center gap-2 ml-2">
              <Avatar role={role} size="sm" />
              <span className="text-sm font-semibold text-gray-700">
                {displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Logout
            </button>
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
          <div className="flex items-center gap-3 py-2">
            <Avatar role={role} size="sm" />
            <span className="text-sm font-semibold text-gray-700">
              {displayName}
            </span>
          </div>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Blogs
          </Link>
          {isAdmin && (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Users
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

Navbar.propTypes = {
  session: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    userId: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};

export default Navbar;