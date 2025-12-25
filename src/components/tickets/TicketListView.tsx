import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTicketsRequest,
  setFilters,
  setPage,
  toggleTicketSelection,
  selectAllTickets,
  clearSelection,
  bulkActionRequest,
} from '@/store/slices/ticketSlice';
import { Card } from '@/components/common';
import { TicketCard } from './TicketCard';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  UserPlus,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const TicketListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    tickets,
    pagination,
    filters,
    selectedTicketIds,
    isLoadingTickets,
    error,
  } = useAppSelector((state) => state.ticket);

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    dispatch(fetchTicketsRequest({}));
  }, [dispatch, filters, pagination.currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  };

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/support/tickets/${ticketId}`);
  };

  const handleSelectAll = () => {
    if (selectedTicketIds.length === tickets.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllTickets());
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedTicketIds.length === 0) return;

    const actionData: any = { action, ticketIds: selectedTicketIds };

    if (action === 'close') {
      actionData.actionData = { status: 'closed' };
    }

    dispatch(bulkActionRequest(actionData));
    setShowBulkActions(false);
  };

  const allSelected = selectedTicketIds.length === tickets.length && tickets.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by ticket #, title, description, or user name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Status
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_user">Waiting for User</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Priority
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Category
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Categories</option>
                <option value="Account Issues">Account Issues</option>
                <option value="Calendar Problems">Calendar Problems</option>
                <option value="Consultation Issues">Consultation Issues</option>
                <option value="Payment Problems">Payment Problems</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Assigned To Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Assigned To
              </label>
              <select
                value={filters.assignedTo || 'all'}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Tickets</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedTicketIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedTicketIds.length} ticket{selectedTicketIds.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => dispatch(clearSelection())}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Bulk Actions
              </button>
            </div>
          </div>

          {showBulkActions && (
            <div className="mt-3 pt-3 border-t border-blue-200 flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('close')}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Close Tickets
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Assign
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tickets List */}
      {isLoadingTickets ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 bg-gray-200 rounded shimmer mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gray-200 rounded shimmer" />
                    <div className="w-16 h-5 bg-gray-200 rounded-lg shimmer" />
                  </div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded shimmer" />
                  <div className="w-full h-3 bg-gray-200 rounded shimmer" />
                  <div className="w-2/3 h-3 bg-gray-200 rounded shimmer" />
                  <div className="flex gap-2">
                    <div className="w-20 h-5 bg-gray-200 rounded-lg shimmer" />
                    <div className="w-16 h-5 bg-gray-200 rounded-lg shimmer" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-lg shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All
            </button>
          </div>

          {/* Ticket Cards */}
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => handleTicketClick(ticket.id)}
                isSelected={selectedTicketIds.includes(ticket.id)}
                onSelect={(id) => dispatch(toggleTicketSelection(id))}
                showCheckbox
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{' '}
                  of {pagination.totalItems} tickets
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 font-medium px-2">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

