import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export const Card = ({ children, className, title, subtitle, action }: CardProps) => {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-card rounded-2xl p-6 border border-gray-100 dark:border-border',
        'transition-all duration-200 ease-out',
        'hover:shadow-md hover:border-gray-200 dark:hover:border-border/80 hover:-translate-y-0.5',
        'shadow-sm',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-card-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

