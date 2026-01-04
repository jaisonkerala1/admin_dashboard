import { SkeletonBox, SkeletonCard, SkeletonCircle } from '@/components/common/Skeleton';

export const WalletHeroCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-4">
      <SkeletonBox width={120} height={14} radius={4} className="mb-3" />
      <div className="bg-gray-200 dark:bg-muted rounded-lg p-4 mb-3" style={{ aspectRatio: '2.5' }}>
        <div className="flex items-center justify-between h-full">
          <div>
            <SkeletonBox width={100} height={10} radius={4} className="mb-1" />
            <SkeletonBox width={140} height={20} radius={4} />
          </div>
          <SkeletonBox width={80} height={40} radius={4} />
        </div>
      </div>
      <SkeletonBox width="100%" height={6} radius={4} className="mb-3" />
      <div className="flex gap-2">
        <SkeletonBox width="50%" height={32} radius={8} />
        <SkeletonBox width="50%" height={32} radius={8} />
      </div>
    </div>
  );
};

export const WalletQuickStatsSkeleton = () => {
  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border p-4">
      <SkeletonBox width={120} height={14} radius={4} className="mb-3" />
      <div className="space-y-3">
        <div>
          <SkeletonBox width={80} height={10} radius={4} className="mb-1" />
          <SkeletonBox width={120} height={18} radius={4} />
        </div>
        <div className="pt-3 border-t border-gray-100 dark:border-border">
          <div className="mb-2">
            <SkeletonBox width={90} height={10} radius={4} className="mb-1" />
            <SkeletonBox width={50} height={14} radius={4} />
          </div>
          <SkeletonBox width="100%" height={80} radius={4} />
        </div>
      </div>
    </div>
  );
};

export const WalletTransactionListSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Date header skeleton */}
      <div className="flex items-center gap-2">
        <SkeletonBox width={4} height={16} radius={2} />
        <SkeletonBox width={100} height={14} radius={4} />
      </div>
      
      {/* Transaction cards */}
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonCard key={index} className="p-4">
          <div className="flex items-center gap-4">
            <SkeletonCircle size={44} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <SkeletonBox width={120} height={16} radius={4} />
                <SkeletonBox width={80} height={16} radius={4} />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBox width={100} height={12} radius={4} />
                <SkeletonBox width={60} height={12} radius={4} />
              </div>
            </div>
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
};

export const WalletChartSkeleton = () => {
  return (
    <SkeletonCard>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <SkeletonBox width={150} height={18} radius={4} className="mb-1" />
          <SkeletonBox width={200} height={14} radius={4} />
        </div>
        
        {/* Chart area */}
        <SkeletonBox width="100%" height={300} radius={8} />
        
        {/* Legend/Footer */}
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <SkeletonCircle size={10} />
              <SkeletonBox width={60} height={12} radius={4} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonCard>
  );
};

export const WalletMetricsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} className="p-5">
          <div className="space-y-3">
            <SkeletonBox width={100} height={14} radius={4} />
            <SkeletonBox width={80} height={24} radius={6} />
            <SkeletonBox width={60} height={12} radius={4} />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
};

