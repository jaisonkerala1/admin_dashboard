import React from 'react';
import type { ApprovalFilters, ApprovalRequestType, ApprovalStatus } from '@/types/approval';
import { Search, X } from 'lucide-react';

interface ApprovalFilterBarProps {
  filters: ApprovalFilters;
  onFiltersChange: (filters: Partial<ApprovalFilters>) => void;
}

export const ApprovalFilterBar: React.FC<ApprovalFilterBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const typeOptions: { value: ApprovalRequestType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'verification_badge', label: 'Verification Badge' },
    { value: 'service_approval', label: 'Service Approval' },
    { value: 'profile_update', label: 'Profile Update' },
  ];

  const statusOptions: { value: ApprovalStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const hasActiveFilters =
    filters.type !== 'all' || filters.status !== 'all' || filters.search !== '';

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      status: 'all',
      search: '',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Type Filter */}
      <select
        value={filters.type}
        onChange={(e) => onFiltersChange({ type: e.target.value as ApprovalRequestType | 'all' })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {typeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onFiltersChange({ status: e.target.value as ApprovalStatus | 'all' })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700 whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  );
};

