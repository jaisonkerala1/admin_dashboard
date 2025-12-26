import { PayoutRequest, PayoutSummary, PayoutStatus } from '@/types/wallet';
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="h-20 bg-gray-200 rounded shimmer" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="h-24 bg-gray-200 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Summary Cards - Minimal Flat Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Pending Payouts</p>
              <p className="text-xl font-bold text-gray-900 truncate">{summary.pendingPayouts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Completed This Month</p>
              <p className="text-xl font-bold text-gray-900 truncate">{formatCurrency(summary.completedThisMonth)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Failed Payouts</p>
              <p className="text-xl font-bold text-gray-900 truncate">{summary.failedPayouts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter - Minimal Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            {selectedStatus !== 'all' && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">1</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PayoutStatus | 'all')}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Payout Requests List - Minimal Card Design */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No payout requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start lg:items-center gap-4 flex-1 min-w-0">
                  <Avatar src={request.astrologerAvatar} name={request.astrologerName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                      <p className="font-semibold text-gray-900">{request.astrologerName}</p>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
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
                      <div className="mt-2 text-xs sm:text-sm text-red-600">
                        <span className="font-medium">Rejection Reason: </span>
                        <span>{request.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewDetails(request.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  {request.status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-1.5 lg:px-4 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs lg:text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-1.5 lg:px-4 lg:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs lg:text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

