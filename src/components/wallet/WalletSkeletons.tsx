import { SkeletonBox, SkeletonCard, SkeletonCircle } from '@/components/common/Skeleton';

export const WalletHeroCardSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 h-[200px] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute bottom-[-40px] left-[-20px] w-24 h-24 bg-white/8 rounded-full" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <SkeletonBox width={100} height={14} radius={4} className="mb-1 bg-white/20" />
            <SkeletonBox width={60} height={12} radius={4} className="bg-white/15" />
          </div>
          {/* Mini chart skeleton */}
          <SkeletonBox width={90} height={45} radius={8} className="bg-white/20" />
        </div>
        
        {/* Balance */}
        <div>
          <SkeletonBox width={200} height={40} radius={6} className="mb-2 bg-white/30" />
          <SkeletonBox width={120} height={16} radius={4} className="bg-white/20" />
        </div>
        
        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <SkeletonBox width={80} height={14} radius={4} className="bg-white/20" />
          <SkeletonBox width={100} height={28} radius={14} className="bg-white/20" />
        </div>
      </div>
    </div>
  );
};

export const WalletQuickStatsSkeleton = () => {
  return (
    <div className="space-y-4">
      <SkeletonBox width={150} height={18} radius={4} className="mb-2" />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} className="min-w-[100px] flex-shrink-0">
            <div className="flex flex-col items-center">
              <SkeletonCircle size={36} className="mb-2" />
              <SkeletonBox width={60} height={12} radius={4} className="mb-1" />
              <SkeletonBox width={70} height={16} radius={4} />
            </div>
          </SkeletonCard>
        ))}
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

