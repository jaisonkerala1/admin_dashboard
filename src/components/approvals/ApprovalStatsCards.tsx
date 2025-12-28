import React from 'react';
import type { ApprovalStats } from '@/types/approval';
import { StatCard, StatCardSkeleton } from '@/components/common';
import { Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface ApprovalStatsCardsProps {
  stats: ApprovalStats | null;
  isLoading?: boolean;
}

export const ApprovalStatsCards: React.FC<ApprovalStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Pending',
      value: stats.totalPending,
      icon: Clock,
    },
    {
      title: 'Approved',
      value: stats.totalApproved,
      icon: CheckCircle2,
    },
    {
      title: 'Rejected',
      value: stats.totalRejected,
      icon: XCircle,
    },
    {
      title: 'Avg Review Time',
      value: `${stats.avgReviewTime.toFixed(1)}h`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={Icon}
          />
        );
      })}
    </div>
  );
};

