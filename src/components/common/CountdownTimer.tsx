import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endDate: string;
  className?: string;
}

export const CountdownTimer = ({ endDate, className = '' }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, total: difference });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second for short durations (< 1 day), otherwise every minute
    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeRemaining) {
    return <span className={className}>Calculating...</span>;
  }

  if (timeRemaining.total <= 0) {
    return (
      <span className={`${className} text-red-600 font-semibold`}>Expired</span>
    );
  }

  const isUrgent = timeRemaining.days < 1;
  const textColor = isUrgent ? 'text-red-600' : 'text-gray-700';
  const fontWeight = isUrgent ? 'font-semibold' : 'font-medium';

  // Format: "2d 14h 30m" or "14h 30m" or "30m 45s" or "45s"
  const parts: string[] = [];
  if (timeRemaining.days > 0) {
    parts.push(`${timeRemaining.days}d`);
  }
  if (timeRemaining.hours > 0 || timeRemaining.days > 0) {
    parts.push(`${timeRemaining.hours}h`);
  }
  if (timeRemaining.minutes > 0 || timeRemaining.hours > 0 || timeRemaining.days > 0) {
    parts.push(`${timeRemaining.minutes}m`);
  }
  // Only show seconds if less than 1 hour remaining
  if (timeRemaining.total < 60 * 60 * 1000) {
    parts.push(`${timeRemaining.seconds}s`);
  }

  return (
    <span className={`${className} ${textColor} ${fontWeight}`}>
      {parts.join(' ')} remaining
    </span>
  );
};

