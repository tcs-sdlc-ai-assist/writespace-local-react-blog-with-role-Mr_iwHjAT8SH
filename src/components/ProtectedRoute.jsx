import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { getSession, isAuthenticated, isAdmin } from '../utils/auth.js';

/**
 * Route guard component for access control.
 * Checks authentication via auth.js; redirects unauthenticated users to '/login'.
 * Accepts optional adminOnly prop; if true, redirects non-admin users to '/dashboard'.
 * Renders children if access is granted.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render.
 * @param {boolean} [props.adminOnly=false] - Whether the route requires admin role.
 * @returns {JSX.Element}
 */
export function ProtectedRoute({ children, adminOnly = false }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
};

export default ProtectedRoute;