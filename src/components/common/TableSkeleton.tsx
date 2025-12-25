import { SkeletonBox, SkeletonCircle, SkeletonCard } from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showAvatar?: boolean;
  className?: string;
}

export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  showAvatar = false,
  className 
}: TableSkeletonProps) => {
  return (
    <SkeletonCard className={className}>
      {/* Header skeleton */}
      <div className="flex gap-4 mb-4 pb-3 border-b border-gray-200">
        {showAvatar && <SkeletonBox width={40} height={16} radius={4} />}
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBox
            key={index}
            width={index === 0 ? 120 : 80}
            height={16}
            radius={4}
            className="flex-1"
          />
        ))}
      </div>
      
      {/* Rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 items-center">
            {showAvatar && (
              <SkeletonCircle size={40} />
            )}
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBox
                key={colIndex}
                width={colIndex === 0 ? 150 : 100}
                height={16}
                radius={4}
                className="flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};

