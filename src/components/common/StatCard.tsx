import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-50',
  className 
}: StatCardProps) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-2xl p-5 border border-gray-100',
        'transition-all duration-200 ease-out',
        'hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5',
        'shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1.5">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm mt-2 font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5 transition-colors duration-200', iconBgColor)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
};

