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
import { Card, Loader } from '@/components/common';
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
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by ticket #, title, description, or user name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned To
              </label>
              <select
                value={filters.assignedTo || 'all'}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Tickets</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Actions Bar */}
      {selectedTicketIds.length > 0 && (
        <Card className="p-4 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedTicketIds.length} ticket(s) selected
              </span>
              <button
                onClick={() => dispatch(clearSelection())}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Bulk Actions
              </button>
            </div>
          </div>

          {showBulkActions && (
            <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800 flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('close')}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <CheckCircle className="w-4 h-4" />
                Close Tickets
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <UserPlus className="w-4 h-4" />
                Assign
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Tickets List */}
      {isLoadingTickets ? (
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      ) : tickets.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-3 px-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
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
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

