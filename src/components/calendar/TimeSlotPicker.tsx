import React from 'react';

interface TimeSlotPickerProps {
  startTime: string;
  endTime: string;
  onChange: (next: { startTime: string; endTime: string }) => void;
  disabled?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ startTime, endTime, onChange, disabled }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
        <input
          type="time"
          value={startTime}
          disabled={disabled}
          onChange={(e) => onChange({ startTime: e.target.value, endTime })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
        <input
          type="time"
          value={endTime}
          disabled={disabled}
          onChange={(e) => onChange({ startTime, endTime: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};


