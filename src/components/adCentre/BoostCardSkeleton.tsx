import { SkeletonBox, SkeletonCircle, SkeletonCard } from '@/components/common/Skeleton';

export const BoostCardSkeleton = () => {
  return (
    <SkeletonCard className="hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonCircle size={40} />
          <div className="space-y-2">
            <SkeletonBox width={120} height={16} radius={4} />
            <SkeletonBox width={100} height={12} radius={4} />
          </div>
        </div>
        <SkeletonBox width={80} height={20} radius={12} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <SkeletonBox width={60} height={14} radius={4} />
          <SkeletonBox width={50} height={14} radius={4} />
        </div>
        <div className="flex justify-between">
          <SkeletonBox width={80} height={14} radius={4} />
          <SkeletonBox width={60} height={14} radius={4} />
        </div>
        <div className="flex justify-between">
          <SkeletonBox width={70} height={14} radius={4} />
          <SkeletonBox width={100} height={14} radius={4} />
        </div>
        <div className="flex justify-between">
          <SkeletonBox width={60} height={14} radius={4} />
          <SkeletonBox width={100} height={14} radius={4} />
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-border">
        <SkeletonBox width="100%" height={32} radius={6} />
        <SkeletonBox width="100%" height={32} radius={6} />
      </div>
    </SkeletonCard>
  );
};

