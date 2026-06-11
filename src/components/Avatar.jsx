import PropTypes from 'prop-types';

const ROLE_CONFIG = {
  admin: {
    emoji: '👑',
    bg: 'bg-violet-600',
  },
  user: {
    emoji: '📖',
    bg: 'bg-indigo-600',
  },
};

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-2xl',
};

/**
 * Reusable avatar component displaying role-distinct visuals.
 * Admin: crown emoji with violet-600 background.
 * User: book emoji with indigo-600 background.
 *
 * @param {Object} props
 * @param {'admin'|'user'} props.role - The user role to determine avatar style.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - The size of the avatar.
 * @returns {JSX.Element}
 */
export function Avatar({ role, size = 'md' }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={`${config.bg} ${sizeClass} flex items-center justify-center rounded-full text-white select-none`}
      role="img"
      aria-label={`${role || 'user'} avatar`}
    >
      <span>{config.emoji}</span>
    </div>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default Avatar;