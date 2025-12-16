import { cn, getStatusColor } from '@/utils/helpers';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span className={cn('badge', getStatusColor(status), className)}>
      {status}
    </span>
  );
};

