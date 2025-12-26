import { PayoutRequest, PayoutSummary, PayoutStatus } from '@/types/wallet';
import { Card } from '@/components/common';
import { Avatar } from '@/components/common';
import { formatCurrency } from '@/utils/formatters';
import { formatRelativeTime } from '@/utils/formatters';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Filter, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

interface WalletPayoutsProps {
  summary: PayoutSummary;
  requests: PayoutRequest[];
  isLoading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onViewDetails?: (id: string) => void;
}

const STATUS_OPTIONS: { value: PayoutStatus | 'all'; label: string; icon: typeof CheckCircle }[] = [
  { value: 'all', label: 'All Statuses', icon: CheckCircle },
  { value: 'pending_review', label: 'Pending Review', icon: Clock },
  { value: 'processing', label: 'Processing', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
];

const getStatusBadge = (status: PayoutStatus) => {
  const baseClasses = 'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5';
  
  switch (status) {
    case 'pending_review':
      return (
        <span className={`${baseClasses} bg-amber-100 text-amber-700`}>
          <Clock className="w-3 h-3" />
          Pending Review
        </span>
      );
    case 'processing':
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          <Clock className="w-3 h-3" />
          Processing
        </span>
      );
    case 'completed':
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    case 'rejected':
      return (
        <span className={`${baseClasses} bg-red-100 text-red-700`}>
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    default:
      return null;
  }
};

export const WalletPayouts = ({
  summary,
  requests,
  isLoading,
  onApprove,
  onReject,
  onViewDetails,
}: WalletPayoutsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PayoutStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        searchQuery === '' ||
        request.astrologerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, selectedStatus]);

  const handleApprove = (id: string) => {
    if (onApprove) {
      onApprove(id);
    } else {
      console.log('Approve payout:', id);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason && onReject) {
      onReject(id, reason);
    } else if (reason) {
      console.log('Reject payout:', id, reason);
    }
  };

  const handleViewDetails = (id: string) => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      console.log('View payout details:', id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="h-20 bg-gray-200 rounded shimmer" />
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-24 bg-gray-200 rounded shimmer" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
              <p className="text-2xl font-bold text-gray-900">{summary.pendingPayouts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.completedThisMonth)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Failed Payouts</p>
              <p className="text-2xl font-bold text-gray-900">{summary.failedPayouts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by astrologer name or payout ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
            {selectedStatus !== 'all' && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">1</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PayoutStatus | 'all')}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* Payout Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No payout requests found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar src={request.astrologerAvatar} name={request.astrologerName} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">{request.astrologerName}</p>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Amount: </span>
                        <span className="font-bold text-gray-900">{formatCurrency(request.requestedAmount)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Requested: </span>
                        <span>{formatRelativeTime(request.requestDate)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Bank: </span>
                        <span>{request.bankAccount.bankName}</span>
                      </div>
                    </div>
                    {request.rejectionReason && (
                      <div className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Rejection Reason: </span>
                        <span>{request.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(request.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {request.status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

