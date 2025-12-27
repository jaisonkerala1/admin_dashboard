import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search,
  Phone, 
  Video, 
  MessageCircle, 
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, Modal, Avatar, SearchBar } from '@/components/common';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { RootState } from '@/store';
import { Consultation } from '@/types';
import {
  fetchConsultationsRequest,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  toggleSelection,
  selectAll,
  deselectAll,
  ConsultationFilter,
} from '@/store/slices/consultationsSlice';
import { ROUTES } from '@/utils/constants';

// Status configuration with colors
const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Calendar },
  inProgress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  noShow: { label: 'No Show', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
};

// Type icons and labels
const typeConfig = {
  phone: { icon: Phone, label: 'Phone', color: 'text-blue-600 bg-blue-50' },
  video: { icon: Video, label: 'Video', color: 'text-purple-600 bg-purple-50' },
  chat: { icon: MessageCircle, label: 'Chat', color: 'text-green-600 bg-green-50' },
  inPerson: { icon: MapPin, label: 'In Person', color: 'text-orange-600 bg-orange-50' },
};

export const Consultations = () => {
  const dispatch = useDispatch();
  const { 
    consultations, 
    isLoading, 
    filter, 
    search, 
    entriesPerPage, 
    currentPage, 
    selectedIds, 
    stats 
  } = useSelector((state: RootState) => state.consultations);
  
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    dispatch(fetchConsultationsRequest());
  }, [dispatch]);

  // Client-side filtering
  const filteredConsultations = consultations.filter(c => {
    // Apply status filter
    if (filter !== 'all' && c.status !== filter) return false;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        c.clientName?.toLowerCase().includes(searchLower) ||
        c.clientPhone?.toLowerCase().includes(searchLower) ||
        c.astrologerId?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredConsultations.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedConsultations = filteredConsultations.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAll(paginatedConsultations.map(c => c._id)));
    } else {
      dispatch(deselectAll());
    }
  };

  const handleSelectOne = (id: string) => {
    dispatch(toggleSelection(id));
  };

  const isAllSelected = paginatedConsultations.length > 0 && paginatedConsultations.every(c => selectedIds.has(c._id));
  const isSomeSelected = paginatedConsultations.some(c => selectedIds.has(c._id)) && !isAllSelected;

  // Helper functions
  const getTypeIcon = (type: string) => {
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.phone;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <PillBadge variant={status as any} label={config.label} showDot={false} />;
  };

  // Pagination helper
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
            <p className="text-gray-500 mt-1">Manage all consultations on the platform</p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-80">
            <SearchBar
              placeholder="Search client, astrologer..."
              value={search}
              onSearch={(query) => dispatch(setSearch(query))}
              onClear={() => dispatch(setSearch(''))}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduled}
            icon={Calendar}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Activity}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={XCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'scheduled', label: 'Scheduled', count: stats.scheduled },
            { key: 'inProgress', label: 'In Progress', count: stats.inProgress },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
            { key: 'noShow', label: 'No Show', count: stats.noShow },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => dispatch(setFilter(key as ConsultationFilter))}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card>
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isSomeSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
            {selectedIds.size > 0 && (
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                Delete Selected
              </button>
            )}
          </div>
          <ShowEntriesDropdown
            value={entriesPerPage}
            onChange={(value) => dispatch(setEntriesPerPage(value))}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading consultations..." />
          </div>
        ) : filteredConsultations.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No consultations found"
            description="No consultations match your current filters"
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={input => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedConsultations.map((consultation) => (
                    <tr key={consultation._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(consultation._id)}
                          onChange={() => handleSelectOne(consultation._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{consultation.clientName}</p>
                          <p className="text-sm text-gray-500">{consultation.clientPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {consultation.astrologerId ? (
                          <Link 
                            to={`${ROUTES.ASTROLOGERS}/${consultation.astrologerId._id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <RoundAvatar
                              src={consultation.astrologerId.profilePicture}
                              name={consultation.astrologerId.name}
                              size="sm"
                              isOnline={false}
                            />
                            <span className="font-medium text-gray-900 hover:text-blue-600">
                              {consultation.astrologerId.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(consultation.scheduledTime).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(consultation.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getTypeIcon(consultation.type)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatDuration(consultation.duration)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(consultation.amount)}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(consultation.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedConsultation(consultation)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet View */}
            <div className="hidden md:block lg:hidden space-y-3">
              {paginatedConsultations.map((consultation) => (
                <div
                  key={consultation._id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(consultation._id)}
                    onChange={() => handleSelectOne(consultation._id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">{consultation.clientName}</p>
                      {consultation.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${consultation.astrologerId._id}`}
                          className="flex items-center gap-2 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={consultation.astrologerId.profilePicture}
                            name={consultation.astrologerId.name}
                            size="sm"
                            isOnline={false}
                          />
                          <span className="text-sm text-gray-600 hover:text-blue-600">
                            {consultation.astrologerId.name}
                          </span>
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-600">
                        {new Date(consultation.scheduledTime).toLocaleDateString()}
                      </span>
                      {getTypeIcon(consultation.type)}
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(consultation.amount)}
                      </span>
                      {getStatusBadge(consultation.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedConsultation(consultation)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View - Optimized Mobile-First Design */}
            <div className="md:hidden space-y-3">
              {paginatedConsultations.map((consultation) => (
                <div
                  key={consultation._id}
                  className="border border-gray-200 rounded-xl bg-white overflow-hidden hover:border-gray-300 active:bg-gray-50 transition-all"
                >
                  {/* Header */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(consultation._id)}
                        onChange={() => handleSelectOne(consultation._id)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base text-gray-900 truncate">{consultation.clientName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{consultation.clientPhone}</p>
                          </div>
                          {getStatusBadge(consultation.status)}
                        </div>
                        
                        {consultation.astrologerId && (
                          <Link 
                            to={`${ROUTES.ASTROLOGERS}/${consultation.astrologerId._id}`}
                            className="flex items-center gap-2 mb-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          >
                            <RoundAvatar
                              src={consultation.astrologerId.profilePicture}
                              name={consultation.astrologerId.name}
                              size="sm"
                              isOnline={false}
                              className="flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Astrologer</p>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {consultation.astrologerId.name}
                              </p>
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="p-3 bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs mb-1">Scheduled</p>
                        <p className="font-semibold text-sm text-gray-900">
                          {new Date(consultation.scheduledTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(consultation.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs mb-1">Type & Duration</p>
                        <div className="flex items-center gap-1.5 mb-1">
                          {getTypeIcon(consultation.type)}
                        </div>
                        <p className="text-xs font-medium text-gray-900">{formatDuration(consultation.duration)}</p>
                      </div>
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-base text-gray-900">{formatCurrency(consultation.amount)}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedConsultation(consultation)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors touch-manipulation"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredConsultations.length)} of {filteredConsultations.length} consultations
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {getPaginationNumbers().map((page, idx) =>
                      typeof page === 'number' ? (
                        <button
                          key={idx}
                          onClick={() => dispatch(setCurrentPage(page))}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={idx} className="px-2 text-gray-400">
                          {page}
                        </span>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modern Consultation Detail Modal */}
      {selectedConsultation && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConsultation(null)}
          title=""
          size="2xl"
        >
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Consultation Details</h3>
                  <p className="text-sm text-gray-500 mt-0.5">ID: {selectedConsultation._id.slice(-8)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedConsultation.status)}
              </div>
            </div>

            {/* Two Column Layout - Mobile First */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* RIGHT SIDEBAR - Shows FIRST on mobile */}
              <div className="order-1 lg:order-2 w-full lg:w-[35%] space-y-4">
                
                {/* Quick Info Cards */}
                <div className="space-y-3">
                  {/* Scheduled Time */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Scheduled</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedConsultation.scheduledTime).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(selectedConsultation.scheduledTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Duration</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDuration(selectedConsultation.duration)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Amount</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedConsultation.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{selectedConsultation.currency}</p>
                  </div>

                  {/* Type */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Type</span>
                    </div>
                    <div className="mt-2">
                      {getTypeIcon(selectedConsultation.type)}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Timeline</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Created</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(selectedConsultation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {selectedConsultation.startedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Started</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(selectedConsultation.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {selectedConsultation.completedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(selectedConsultation.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {selectedConsultation.cancelledAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cancelled</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(selectedConsultation.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* LEFT CONTENT - Shows SECOND on mobile */}
              <div className="order-2 lg:order-1 w-full lg:w-[65%] space-y-6">
                
                {/* Client Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Client Information
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {selectedConsultation.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedConsultation.clientName}</p>
                          <p className="text-sm text-gray-600">{selectedConsultation.clientPhone}</p>
                        </div>
                      </div>
                    </div>
                    {selectedConsultation.clientEmail && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm text-gray-900">{selectedConsultation.clientEmail}</p>
                      </div>
                    )}
                    {(selectedConsultation.clientAge || selectedConsultation.clientGender) && (
                      <div className="pt-3 border-t border-gray-100 flex gap-4">
                        {selectedConsultation.clientAge && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Age</p>
                            <p className="text-sm text-gray-900">{selectedConsultation.clientAge} years</p>
                          </div>
                        )}
                        {selectedConsultation.clientGender && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Gender</p>
                            <p className="text-sm text-gray-900 capitalize">{selectedConsultation.clientGender}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Astrologer */}
                {selectedConsultation.astrologerId && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Astrologer</h4>
                    <Link
                      to={`${ROUTES.ASTROLOGERS}/${selectedConsultation.astrologerId._id}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all block"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={selectedConsultation.astrologerId.profilePicture}
                          name={selectedConsultation.astrologerId.name}
                          size="lg"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {selectedConsultation.astrologerId.name}
                          </p>
                          <p className="text-sm text-gray-600">{selectedConsultation.astrologerId.email}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Topics */}
                {selectedConsultation.consultationTopics && selectedConsultation.consultationTopics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsultation.consultationTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedConsultation.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes</h4>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedConsultation.notes}</p>
                    </div>
                  </div>
                )}

                {/* Rating & Feedback */}
                {selectedConsultation.rating && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Client Feedback</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < selectedConsultation.rating!
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedConsultation.rating}/5
                        </span>
                      </div>
                      {selectedConsultation.feedback && (
                        <p className="text-sm text-gray-900">{selectedConsultation.feedback}</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </Modal>
      )}
    </MainLayout>
  );
};
