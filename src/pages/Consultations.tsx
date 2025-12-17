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
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, Modal, Avatar } from '@/components/common';
import { formatCurrency, formatDuration, formatDateTime } from '@/utils/formatters';
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
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search client, astrologer..."
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {paginatedConsultations.map((consultation) => (
                <div
                  key={consultation._id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(consultation._id)}
                      onChange={() => handleSelectOne(consultation._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{consultation.clientName}</p>
                        {getStatusBadge(consultation.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{consultation.clientPhone}</p>
                      
                      {consultation.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${consultation.astrologerId._id}`}
                          className="flex items-center gap-2 mb-3 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={consultation.astrologerId.profilePicture}
                            name={consultation.astrologerId.name}
                            size="sm"
                            isOnline={false}
                          />
                          <div>
                            <p className="text-xs text-gray-500">Astrologer</p>
                            <p className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {consultation.astrologerId.name}
                            </p>
                          </div>
                        </Link>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Scheduled</p>
                          <p className="font-medium text-gray-900">
                            {new Date(consultation.scheduledTime).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(consultation.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Type & Duration</p>
                          <div className="space-y-1">
                            {getTypeIcon(consultation.type)}
                            <p className="text-sm text-gray-900">{formatDuration(consultation.duration)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{formatCurrency(consultation.amount)}</p>
                        <button 
                          onClick={() => setSelectedConsultation(consultation)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
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

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConsultation(null)}
          title="Consultation Details"
        >
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              {getStatusBadge(selectedConsultation.status)}
              <span className="text-sm text-gray-500">
                ID: {selectedConsultation._id.slice(-8)}
              </span>
            </div>

            {/* Client Info */}
            <Card className="!p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Client Information</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedConsultation.clientName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedConsultation.clientPhone}
                  </span>
                </div>
                {selectedConsultation.clientEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedConsultation.clientEmail}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Astrologer Info */}
            {selectedConsultation.astrologerId && (
              <Card className="!p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Astrologer</h4>
                <Link
                  to={`${ROUTES.ASTROLOGERS}/${selectedConsultation.astrologerId._id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    src={selectedConsultation.astrologerId.profilePicture}
                    name={selectedConsultation.astrologerId.name}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 hover:text-blue-600">
                      {selectedConsultation.astrologerId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedConsultation.astrologerId.email}
                    </p>
                  </div>
                </Link>
              </Card>
            )}

            {/* Consultation Details */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="!p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  {getTypeIcon(selectedConsultation.type)}
                  <span className="text-xs font-medium uppercase">Type</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {typeConfig[selectedConsultation.type as keyof typeof typeConfig]?.label || selectedConsultation.type}
                </p>
              </Card>

              <Card className="!p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Scheduled</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(selectedConsultation.scheduledTime)}
                </p>
              </Card>

              <Card className="!p-4">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Duration</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDuration(selectedConsultation.duration)}
                </p>
              </Card>

              <Card className="!p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Amount</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(selectedConsultation.amount)}
                </p>
              </Card>
            </div>

            {/* Additional Details */}
            {selectedConsultation.notes && (
              <Card className="!p-4 bg-amber-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-900">{selectedConsultation.notes}</p>
              </Card>
            )}

            {/* Topics */}
            {selectedConsultation.consultationTopics && selectedConsultation.consultationTopics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedConsultation.consultationTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rating & Feedback */}
            {selectedConsultation.rating && (
              <Card className="!p-4 bg-green-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Client Feedback</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < selectedConsultation.rating!
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedConsultation.rating}/5
                  </span>
                </div>
                {selectedConsultation.feedback && (
                  <p className="text-sm text-gray-900">{selectedConsultation.feedback}</p>
                )}
              </Card>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{formatDateTime(selectedConsultation.createdAt)}</span>
              </div>
              {selectedConsultation.startedAt && (
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span>{formatDateTime(selectedConsultation.startedAt)}</span>
                </div>
              )}
              {selectedConsultation.completedAt && (
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span>{formatDateTime(selectedConsultation.completedAt)}</span>
                </div>
              )}
              {selectedConsultation.cancelledAt && (
                <div className="flex justify-between">
                  <span>Cancelled:</span>
                  <span>{formatDateTime(selectedConsultation.cancelledAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};
