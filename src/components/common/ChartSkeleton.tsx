import { SkeletonBox, SkeletonCircle, SkeletonCard } from './Skeleton';

interface ChartSkeletonProps {
  height?: number;
  showLegend?: boolean;
  className?: string;
  type?: 'line' | 'bar' | 'pie';
}

export const ChartSkeleton = ({ 
  height = 300, 
  showLegend = true,
  className,
  type = 'bar'
}: ChartSkeletonProps) => {
  return (
    <SkeletonCard className={className}>
      {/* Title skeleton */}
      <SkeletonBox width={160} height={20} radius={6} className="mb-4" />
      
      {/* Chart area skeleton */}
      <div style={{ height }} className="relative">
        {type === 'bar' && (
          <div className="flex items-end justify-between h-full pb-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBox
                key={index}
                width={40}
                height={`${(index + 1) * 20}%`}
                radius={4}
              />
            ))}
          </div>
        )}
        
        {type === 'line' && (
          <div className="relative h-full">
            {/* Line path placeholder */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2">
              <SkeletonBox width="100%" height={2} radius={2} />
            </div>
            {/* Data points */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end h-full pb-8">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonCircle key={index} size={8} />
              ))}
            </div>
          </div>
        )}
        
        {type === 'pie' && (
          <div className="flex items-center justify-center h-full">
            <SkeletonCircle size={120} />
          </div>
        )}
        
        {/* X-axis labels skeleton */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {Array.from({ length: type === 'line' ? 7 : 5 }).map((_, index) => (
            <SkeletonBox
              key={index}
              width={30}
              height={12}
              radius={4}
            />
          ))}
        </div>
      </div>
      
      {/* Legend skeleton */}
      {showLegend && (
        <div className="flex gap-4 mt-4 justify-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <SkeletonBox width={12} height={12} radius={2} />
              <SkeletonBox width={60} height={14} radius={4} />
            </div>
          ))}
        </div>
      )}
    </SkeletonCard>
  );
};

