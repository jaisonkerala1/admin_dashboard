import React from 'react';

const days = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const WeekDaySelector: React.FC<{
  value: number;
  onChange: (dayOfWeek: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Day of week</label>
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(d.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              value === d.value 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800' 
                : 'bg-white dark:bg-card text-gray-700 dark:text-foreground border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
};



