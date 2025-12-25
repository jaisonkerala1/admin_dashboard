import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface ShimmerProps {
  children: ReactNode;
  className?: string;
}

export const Shimmer = ({ children, className }: ShimmerProps) => {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="shimmer w-full h-full">
        {children}
      </div>
    </div>
  );
};

