import { StatCardSkeleton } from '@/components/common/StatCardSkeleton';
import { ChartSkeleton } from '@/components/common/ChartSkeleton';
import { SkeletonBox, SkeletonCard } from '@/components/common/Skeleton';

export const CommunicationOverviewSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Communication Type Distribution */}
      <SkeletonCard>
        {/* Title */}
        <SkeletonBox width={240} height={20} radius={6} className="mb-4" />
        
        {/* Pie chart placeholder */}
        <div className="h-80 flex items-center justify-center">
          <div className="relative">
            <SkeletonBox width={200} height={200} radius="50%" />
            {/* Legend placeholders */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <SkeletonBox width={12} height={12} radius={2} />
                <SkeletonBox width={60} height={14} radius={4} />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBox width={12} height={12} radius={2} />
                <SkeletonBox width={60} height={14} radius={4} />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBox width={12} height={12} radius={2} />
                <SkeletonBox width={60} height={14} radius={4} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <SkeletonBox width={60} height={24} radius={6} className="mx-auto mb-2" />
            <SkeletonBox width={70} height={14} radius={4} className="mx-auto" />
          </div>
          <div className="text-center">
            <SkeletonBox width={60} height={24} radius={6} className="mx-auto mb-2" />
            <SkeletonBox width={80} height={14} radius={4} className="mx-auto" />
          </div>
          <div className="text-center">
            <SkeletonBox width={60} height={24} radius={6} className="mx-auto mb-2" />
            <SkeletonBox width={70} height={14} radius={4} className="mx-auto" />
          </div>
        </div>
      </SkeletonCard>
    </div>
  );
};

