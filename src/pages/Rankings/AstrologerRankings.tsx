import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Award, TrendingUp, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryTab } from '@/components/rankings/CategoryTab';
import { RootState } from '@/store';
import {
  fetchRankingsRequest,
  setActiveCategory,
} from '@/store/slices/rankingsSlice';
import { RankingCategoryId, RankingCategory } from '@/types';
import { cn } from '@/utils/helpers';
import { SkeletonBox, SkeletonCard, SkeletonCircle } from '@/components/common/Skeleton';
import { StatCardSkeleton } from '@/components/common';

const categories: RankingCategory[] = [
  {
    id: 'top',
    label: 'Top Rated',
    icon: Star,
    sortField: 'rating',
    description: 'Astrologers with highest ratings and reviews',
  },
  {
    id: 'experienced',
    label: 'Most Experienced',
    icon: Award,
    sortField: 'experience',
    description: 'Astrologers with most years of experience',
  },
  {
    id: 'popular',
    label: 'Most Popular',
    icon: Users,
    sortField: 'totalConsultations',
    description: 'Astrologers with most consultations',
  },
  {
    id: 'trending',
    label: 'Trending',
    icon: TrendingUp,
    sortField: 'trendingScore',
    description: 'Astrologers with recent high activity',
  },
];

export const AstrologerRankings = () => {
  const dispatch = useDispatch();
  const {
    categories: rankingsData,
    activeCategory,
    isLoading,
    stats,
  } = useSelector((state: RootState) => state.rankings);

  useEffect(() => {
    // Fetch rankings for active category on mount
    dispatch(fetchRankingsRequest(activeCategory));
  }, [dispatch, activeCategory]);

  const handleCategoryChange = (category: RankingCategoryId) => {
    dispatch(setActiveCategory(category));
  };

  const activeCategoryData = categories.find((c) => c.id === activeCategory);
  const currentRankings = rankingsData[activeCategory] || [];
  const currentStats = stats[activeCategory] || null;

  return (
    <MainLayout>
      <PageHeader
        title="Astrologer Rankings"
        subtitle="Manage featured astrologer lists that end users see in the app"
      />

      {isLoading ? (
        <div className="space-y-6">
          {/* Category Tabs Skeleton */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto pb-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} width={120} height={20} radius={4} className="shimmer" />
              ))}
            </div>
          </div>

          {/* Category Description Skeleton */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <SkeletonBox width={300} height={16} radius={4} className="shimmer" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Ranking Cards Skeleton */}
          <SkeletonCard>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <SkeletonCircle size={40} />
                  <SkeletonCircle size={48} />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox width={180} height={16} radius={4} />
                    <SkeletonBox width={120} height={14} radius={4} />
                    <SkeletonBox width={100} height={12} radius={4} />
                  </div>
                  <div className="flex gap-2">
                    <SkeletonBox width={32} height={32} radius={8} />
                    <SkeletonBox width={32} height={32} radius={8} />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>
      ) : (
        <>
          {/* Category Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Description */}
          {activeCategoryData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">{activeCategoryData.label}:</span>{' '}
                {activeCategoryData.description}
              </p>
            </div>
          )}

          {/* Category Content */}
          <CategoryTab
            category={activeCategory}
            rankings={currentRankings}
            stats={currentStats}
            isLoading={false}
          />
        </>
      )}
    </MainLayout>
  );
};

