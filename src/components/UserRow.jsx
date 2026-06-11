import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';

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
 * Returns a role badge pill with appropriate styling.
 * @param {'admin'|'user'} role - The user role.
 * @returns {JSX.Element} A styled role badge.
 */
function RoleBadge({ role }) {
  const badgeClass =
    role === 'admin'
      ? 'bg-violet-100 text-violet-700 border-violet-200'
      : 'bg-indigo-100 text-indigo-700 border-indigo-200';

  return (
    <span
      className={`${badgeClass} inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`}
    >
      {role === 'admin' ? '👑 Admin' : '📖 User'}
    </span>
  );
}

RoleBadge.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
};

/**
 * Determines whether the delete action should be disabled for a given user.
 * @param {Object} user - The user object.
 * @param {Object|null} session - The current session object.
 * @returns {{ disabled: boolean, reason: string }} Whether delete is disabled and why.
 */
function getDeleteState(user, session) {
  if (user.username === 'admin') {
    return { disabled: true, reason: 'Default admin cannot be deleted' };
  }
  if (session && (session.username === user.username || session.userId === user.id)) {
    return { disabled: true, reason: 'You cannot delete yourself' };
  }
  return { disabled: false, reason: '' };
}

/**
 * User display component for the admin user management panel.
 * Shows user avatar, display name, username, role badge pill, created date,
 * and delete button. Delete is disabled for default admin and self with tooltip.
 * Responsive: table row on desktop, card on mobile.
 *
 * @param {Object} props
 * @param {Object} props.user - The user data object.
 * @param {string} props.user.id - The user ID.
 * @param {string} props.user.username - The username.
 * @param {string} [props.user.displayName] - The display name.
 * @param {'admin'|'user'} [props.user.role='user'] - The user role.
 * @param {string} [props.user.createdAt] - ISO date string of account creation.
 * @param {Object|null} [props.session=null] - The current user session.
 * @param {Function} [props.onDelete] - Callback when delete is clicked, receives user id.
 * @returns {JSX.Element}
 */
export function UserRow({ user, session = null, onDelete }) {
  const role = user.role || 'user';
  const displayName = user.displayName || user.username;
  const { disabled, reason } = getDeleteState(user, session);

  return (
    <>
      {/* Desktop: table row */}
      <tr className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar role={role} size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{displayName}</span>
              <span className="text-xs text-gray-400">@{user.username}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <RoleBadge role={role} />
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-gray-500">
            {user.createdAt ? formatDate(user.createdAt) : '—'}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(user.id)}
              disabled={disabled}
              title={disabled ? reason : `Delete user ${user.username}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
              aria-label={
                disabled
                  ? `Cannot delete user ${user.username}: ${reason}`
                  : `Delete user ${user.username}`
              }
            >
              🗑️ Delete
            </button>
          )}
        </td>
      </tr>

      {/* Mobile: card */}
      <div className="md:hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar role={role} size="md" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{displayName}</span>
              <span className="text-xs text-gray-400">@{user.username}</span>
            </div>
          </div>
          <RoleBadge role={role} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {user.createdAt ? `Joined ${formatDate(user.createdAt)}` : ''}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(user.id)}
              disabled={disabled}
              title={disabled ? reason : `Delete user ${user.username}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
              aria-label={
                disabled
                  ? `Cannot delete user ${user.username}: ${reason}`
                  : `Delete user ${user.username}`
              }
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'user']),
    createdAt: PropTypes.string,
  }).isRequired,
  session: PropTypes.shape({
    username: PropTypes.string,
    userId: PropTypes.string,
    role: PropTypes.string,
  }),
  onDelete: PropTypes.func,
};

export default UserRow;