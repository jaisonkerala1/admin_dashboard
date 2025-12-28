import { useState, useEffect, useRef } from 'react';
import { UserPlus } from 'lucide-react';
import { RankingCard } from './RankingCard';
import { RankingStats } from './RankingStats';
import { BulkActions } from './BulkActions';
import { AddAstrologerModal } from './AddAstrologerModal';
import { Card, Loader, EmptyState } from '@/components/common';
import { AstrologerRanking, RankingCategoryId, CategoryStats } from '@/types';
import { Trophy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToastContext } from '@/contexts/ToastContext';
import {
  pinAstrologer,
  unpinAstrologer,
  hideAstrologer,
  unhideAstrologer,
  bulkActionsRequest,
  addAstrologersRequest,
  fetchRankingsRequest,
} from '@/store/slices/rankingsSlice';

interface CategoryTabProps {
  category: RankingCategoryId;
  rankings: AstrologerRanking[];
  stats: CategoryStats | null;
  isLoading: boolean;
}

export const CategoryTab = ({ category, rankings, stats, isLoading }: CategoryTabProps) => {
  const dispatch = useAppDispatch();
  const { success, error: toastError } = useToastContext();
  const { error: rankingsError } = useAppSelector((state) => state.rankings);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Show toast notifications for errors
  useEffect(() => {
    if (rankingsError) {
      toastError(rankingsError);
    }
  }, [rankingsError, toastError]);

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

  const handleAddAstrologers = (astrologerIds: string[]) => {
    setLastAddedCount(astrologerIds.length);
    dispatch(
      addAstrologersRequest({
        astrologerIds,
        category,
      })
    );
  };

  // Track previous rankings count to detect additions
  const prevRankingsCount = useRef(rankings.length);
  const [lastAddedCount, setLastAddedCount] = useState(0);

  useEffect(() => {
    if (rankings.length > prevRankingsCount.current && !isLoading && lastAddedCount > 0) {
      success(`Successfully added ${lastAddedCount} astrologer(s) to ${category} rankings`);
      setLastAddedCount(0);
    }
    prevRankingsCount.current = rankings.length;
  }, [rankings.length, isLoading, category, success, lastAddedCount]);

  const existingAstrologerIds = new Set(rankings.map((r) => r.astrologerId));

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
      <RankingStats stats={stats} />

      {/* Add Astrologer Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Astrologers
        </button>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
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

      {/* Add Astrologer Modal */}
      <AddAstrologerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAstrologers}
        existingAstrologerIds={existingAstrologerIds}
        category={category.charAt(0).toUpperCase() + category.slice(1)}
      />
    </div>
  );
};

