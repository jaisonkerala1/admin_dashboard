import { useEffect, useState } from 'react';
import { Search, Trash2, EyeOff, MessageSquare } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, Modal } from '@/components/common';
import { discussionsApi } from '@/api';
import { Discussion } from '@/types';
import { formatDateTime, formatNumber } from '@/utils/formatters';

export const Discussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [showHideModal, setShowHideModal] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadDiscussions();
  }, [search]);

  const loadDiscussions = async () => {
    try {
      setIsLoading(true);
      const response = await discussionsApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      setDiscussions(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHide = async () => {
    if (!selectedDiscussion || !hideReason.trim()) return;
    try {
      setIsProcessing(true);
      await discussionsApi.moderate(selectedDiscussion._id, {
        isHidden: true,
        hiddenReason: hideReason,
      });
      setShowHideModal(false);
      setHideReason('');
      setSelectedDiscussion(null);
      await loadDiscussions();
    } catch (err) {
      console.error('Failed to hide discussion:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;
    try {
      await discussionsApi.delete(id);
      await loadDiscussions();
    } catch (err) {
      console.error('Failed to delete discussion:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await discussionsApi.deleteComment(commentId);
      await loadDiscussions();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Discussions Moderation"
        subtitle="Moderate and manage all discussions"
      />

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading discussions..." />
          </div>
        ) : discussions.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No discussions found"
            description="No discussions match your search"
          />
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div
                key={discussion._id}
                className={`p-4 rounded-lg border ${
                  discussion.isHidden ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={discussion.userId.profilePicture} name={discussion.userId.name} />
                    <div>
                      <p className="font-medium text-gray-900">{discussion.userId.name}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(discussion.createdAt)}</p>
                    </div>
                  </div>
                  <span className="badge bg-gray-100 text-gray-700">{discussion.category}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                <p className="text-gray-700 mb-3">{discussion.content}</p>

                {discussion.tags && discussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {discussion.tags.map((tag, i) => (
                      <span key={i} className="badge bg-blue-100 text-blue-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {discussion.isHidden && discussion.hiddenReason && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                    <strong>Hidden reason:</strong> {discussion.hiddenReason}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatNumber(discussion.likes)} likes</span>
                    <span>{formatNumber(discussion.comments.length)} comments</span>
                    <span>{formatNumber(discussion.views)} views</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {!discussion.isHidden && (
                      <button
                        onClick={() => {
                          setSelectedDiscussion(discussion);
                          setShowHideModal(true);
                        }}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                      >
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(discussion._id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Comments */}
                {discussion.comments.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                    {discussion.comments.slice(0, 3).map((comment) => (
                      <div key={comment._id} className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <Avatar src={comment.userId.profilePicture} name={comment.userId.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{comment.userId.name}</p>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {discussion.comments.length > 3 && (
                      <p className="text-sm text-gray-500 pl-9">
                        +{discussion.comments.length - 3} more comments
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showHideModal}
        onClose={() => {
          setShowHideModal(false);
          setSelectedDiscussion(null);
          setHideReason('');
        }}
        title="Hide Discussion"
      >
        {selectedDiscussion && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for hiding this discussion:
            </p>
            <textarea
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              className="input min-h-[120px] resize-none"
              placeholder="Enter reason for hiding..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowHideModal(false)}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleHide}
                disabled={!hideReason.trim() || isProcessing}
                className="btn btn-danger btn-md"
              >
                {isProcessing ? 'Hiding...' : 'Hide Discussion'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

