import { SkeletonBox, SkeletonCard } from './Skeleton';
import { cn } from '@/utils/helpers';

interface StatCardSkeletonProps {
  className?: string;
}

export const StatCardSkeleton = ({ className }: StatCardSkeletonProps) => {
  return (
    <SkeletonCard className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title skeleton */}
          <SkeletonBox width={80} height={14} radius={4} className="mb-2" />
          {/* Value skeleton */}
          <SkeletonBox width={60} height={24} radius={6} className="mb-2" />
          {/* Trend skeleton (optional) */}
          <SkeletonBox width={50} height={14} radius={4} />
        </div>
        {/* Icon skeleton */}
        <SkeletonBox width={36} height={36} radius={8} />
      </div>
    </SkeletonCard>
  );
};

