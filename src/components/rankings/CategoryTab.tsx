import { useState } from 'react';
import { RankingCard } from './RankingCard';
import { RankingStats } from './RankingStats';
import { BulkActions } from './BulkActions';
import { Card, Loader, EmptyState } from '@/components/common';
import { AstrologerRanking, RankingCategoryId, CategoryStats } from '@/types';
import { Trophy } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import {
  pinAstrologer,
  unpinAstrologer,
  hideAstrologer,
  unhideAstrologer,
  bulkActionsRequest,
} from '@/store/slices/rankingsSlice';

interface CategoryTabProps {
  category: RankingCategoryId;
  rankings: AstrologerRanking[];
  stats: CategoryStats | null;
  isLoading: boolean;
}

export const CategoryTab = ({ category, rankings, stats, isLoading }: CategoryTabProps) => {
  const dispatch = useAppDispatch();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handlePin = (id: string) => {
    dispatch(pinAstrologer({ astrologerId: id, category }));
  };

  const handleUnpin = (id: string) => {
    dispatch(unpinAstrologer({ astrologerId: id, category }));
  };

  const handleHide = (id: string) => {
    dispatch(hideAstrologer({ astrologerId: id, category }));
  };

  const handleUnhide = (id: string) => {
    dispatch(unhideAstrologer({ astrologerId: id, category }));
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkPin = () => {
    dispatch(
      bulkActionsRequest({
        action: 'pin',
        astrologerIds: Array.from(selectedIds),
        category,
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkUnpin = () => {
    dispatch(
      bulkActionsRequest({
        action: 'unpin',
        astrologerIds: Array.from(selectedIds),
        category,
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkHide = () => {
    dispatch(
      bulkActionsRequest({
        action: 'hide',
        astrologerIds: Array.from(selectedIds),
        category,
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkUnhide = () => {
    dispatch(
      bulkActionsRequest({
        action: 'unhide',
        astrologerIds: Array.from(selectedIds),
        category,
      })
    );
    setSelectedIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <Loader size="lg" text="Loading rankings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <RankingStats stats={stats} category={category} />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        category={category}
        onPin={handleBulkPin}
        onUnpin={handleBulkUnpin}
        onHide={handleBulkHide}
        onUnhide={handleBulkUnhide}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Rankings List */}
      <Card>
        {rankings.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No rankings found"
            description="No astrologers match this category yet"
          />
        ) : (
          <div className="space-y-3">
            {rankings.map((astrologer, index) => (
              <RankingCard
                key={astrologer.astrologerId}
                astrologer={astrologer}
                rank={astrologer.liveRank || index + 1}
                category={category}
                onPin={handlePin}
                onUnpin={handleUnpin}
                onHide={handleHide}
                onUnhide={handleUnhide}
                isSelected={selectedIds.has(astrologer.astrologerId)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

