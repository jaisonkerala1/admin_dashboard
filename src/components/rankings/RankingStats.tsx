import { StatCard } from '@/components/common';
import { CategoryStats, RankingCategoryId } from '@/types';
import { formatNumber } from '@/utils/formatters';
import { Trophy, Users, TrendingUp, Eye, EyeOff } from 'lucide-react';

interface RankingStatsProps {
  stats: CategoryStats | null;
  category: RankingCategoryId;
}

export const RankingStats = ({ stats, category }: RankingStatsProps) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Astrologers"
        value={formatNumber(stats.totalAstrologers)}
        icon={Users}
      />
      <StatCard
        title="Average Score"
        value={stats.averageScore.toFixed(1)}
        icon={Trophy}
      />
      <StatCard
        title="Pinned"
        value={stats.pinnedCount}
        icon={TrendingUp}
      />
      <StatCard
        title="Hidden"
        value={stats.hiddenCount}
        icon={EyeOff}
      />
    </div>
  );
};

