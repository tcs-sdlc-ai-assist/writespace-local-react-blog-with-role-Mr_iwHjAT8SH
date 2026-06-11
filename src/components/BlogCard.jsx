import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';

const ACCENT_BORDERS = [
  'border-indigo-400',
  'border-violet-400',
  'border-pink-400',
  'border-teal-400',
];

const ACCENT_HOVER = [
  'hover:border-indigo-500',
  'hover:border-violet-500',
  'hover:border-pink-500',
  'hover:border-teal-500',
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
 * @param {number} [maxLength=150] - Maximum character length.
 * @returns {string} Truncated text.
 */
function truncate(text, maxLength = 150) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
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
 * Blog post preview card component.
 * Displays title, content excerpt, author name with Avatar, creation date,
 * and a deterministic accent border based on index.
 * Shows edit/delete buttons based on ownership or admin role.
 *
 * @param {Object} props
 * @param {Object} props.post - The post data object.
 * @param {string} props.post.id - The post ID.
 * @param {string} props.post.title - The post title.
 * @param {string} props.post.content - The post content.
 * @param {string} props.post.author - The post author username.
 * @param {string} [props.post.authorRole] - The post author role.
 * @param {string} [props.post.createdAt] - ISO date string of creation.
 * @param {number} props.index - The index of the card for accent cycling.
 * @param {Object|null} [props.session=null] - The current user session.
 * @param {Function} [props.onEdit] - Callback when edit is clicked, receives post.
 * @param {Function} [props.onDelete] - Callback when delete is clicked, receives post id.
 * @returns {JSX.Element}
 */
export function BlogCard({ post, index, session = null, onEdit, onDelete }) {
  const accentIndex = ((index % 4) + 4) % 4;
  const borderClass = ACCENT_BORDERS[accentIndex];
  const hoverClass = ACCENT_HOVER[accentIndex];
  const showActions = canModify(session, post);
  const authorRole = post.authorRole || 'user';

  return (
    <div
      className={`${borderClass} ${hoverClass} border-l-4 rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
          {post.title}
        </h2>
        {showActions && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(post)}
                className="rounded-lg px-2.5 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                aria-label={`Edit post: ${post.title}`}
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="rounded-lg px-2.5 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label={`Delete post: ${post.title}`}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        {truncate(post.content)}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Avatar role={authorRole} size="sm" />
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
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.string,
    authorRole: PropTypes.oneOf(['admin', 'user']),
    userId: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  session: PropTypes.shape({
    username: PropTypes.string,
    userId: PropTypes.string,
    role: PropTypes.string,
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default BlogCard;