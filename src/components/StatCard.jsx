import PropTypes from 'prop-types';

const ACCENT_CLASSES = {
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  sky: 'bg-sky-100 text-sky-700 border-sky-200',
};

const ICON_BG_CLASSES = {
  violet: 'bg-violet-200',
  indigo: 'bg-indigo-200',
  emerald: 'bg-emerald-200',
  amber: 'bg-amber-200',
  rose: 'bg-rose-200',
  sky: 'bg-sky-200',
};

/**
 * Reusable stat card component for the admin dashboard.
 * Displays a label, value, icon/emoji, and accent color.
 *
 * @param {Object} props
 * @param {string} props.label - The stat label text (e.g. "Total Posts").
 * @param {string|number} props.value - The stat value to display.
 * @param {string} [props.icon='📊'] - An emoji or text icon to display.
 * @param {'violet'|'indigo'|'emerald'|'amber'|'rose'|'sky'} [props.accent='indigo'] - The accent color theme.
 * @returns {JSX.Element}
 */
export function StatCard({ label, value, icon = '📊', accent = 'indigo' }) {
  const accentClass = ACCENT_CLASSES[accent] || ACCENT_CLASSES.indigo;
  const iconBgClass = ICON_BG_CLASSES[accent] || ICON_BG_CLASSES.indigo;

  return (
    <div
      className={`${accentClass} rounded-xl border p-5 flex items-center gap-4 shadow-sm`}
    >
      <div
        className={`${iconBgClass} h-12 w-12 flex items-center justify-center rounded-lg text-2xl select-none`}
      >
        <span>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-tight">{value}</span>
        <span className="text-sm font-medium opacity-75">{label}</span>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  accent: PropTypes.oneOf(['violet', 'indigo', 'emerald', 'amber', 'rose', 'sky']),
};

export default StatCard;