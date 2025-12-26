import { useState, useMemo } from 'react';
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from '@/types/wallet';
import { WalletTransactionCard } from './WalletTransactionCard';
import { Card } from '@/components/common';
import { Search, Filter, Download, X } from 'lucide-react';
import { format } from 'date-fns';

interface WalletTransactionsProps {
  transactions: WalletTransaction[];
  isLoading?: boolean;
}

const TRANSACTION_TYPES: { value: WalletTransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'payment', label: 'Payments' },
  { value: 'refund', label: 'Refunds' },
  { value: 'commission', label: 'Commissions' },
  { value: 'payout', label: 'Payouts' },
];

const TRANSACTION_STATUSES: { value: WalletTransactionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export const WalletTransactions = ({ transactions, isLoading }: WalletTransactionsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<WalletTransactionType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<WalletTransactionStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter((txn) => {
      const matchesSearch =
        searchQuery === '' ||
        txn.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || txn.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    const grouped: { [key: string]: WalletTransaction[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered.forEach((txn) => {
      const txnDate = new Date(txn.timestamp);
      txnDate.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - txnDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let label = '';
      if (diffDays === 0) {
        label = 'Today';
      } else if (diffDays === 1) {
        label = 'Yesterday';
      } else if (diffDays < 7) {
        label = format(txnDate, 'EEEE'); // Day name
      } else if (diffDays < 30) {
        label = format(txnDate, 'MMM d'); // Month day
      } else {
        label = format(txnDate, 'MMM d, yyyy'); // Full date
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(txn);
    });

    return grouped;
  }, [transactions, searchQuery, selectedType, selectedStatus]);

  const handleCopyTransactionId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  const handleExport = () => {
    // Export functionality - would be implemented with backend
    console.log('Export transactions');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-20 bg-gray-200 rounded shimmer" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar - Minimal Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(selectedType !== 'all' || selectedStatus !== 'all') && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {[selectedType !== 'all' ? 1 : 0, selectedStatus !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Transaction Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as WalletTransactionType | 'all')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as WalletTransactionStatus | 'all')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TRANSACTION_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedType !== 'all' || selectedStatus !== 'all') && (
              <div className="sm:col-span-2">
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedStatus('all');
                  }}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                  <span>Clear all filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transactions List - Minimal Card Design */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([dateLabel, txns]) => (
              <div key={dateLabel}>
                {/* Date Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  <h3 className="text-sm font-semibold text-gray-700 tracking-wide">{dateLabel}</h3>
                  <span className="text-xs text-gray-500">({txns.length} transactions)</span>
                </div>

                {/* Transaction Cards */}
                <div className="space-y-1">
                  {txns.map((transaction) => (
                    <WalletTransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onCopy={handleCopyTransactionId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

