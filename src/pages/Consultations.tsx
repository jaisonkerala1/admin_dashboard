import { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  Video, 
  MessageCircle, 
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  History,
  RefreshCw
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar } from '@/components/common';
import { consultationsApi } from '@/api';
import { Consultation } from '@/types';
import { formatCurrency, formatDateTime, formatDuration } from '@/utils/formatters';

// Status configuration with colors
const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  inProgress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  noShow: { label: 'No Show', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

// Type icons
const typeIcons = {
  phone: Phone,
  video: Video,
  chat: MessageCircle,
  inPerson: MapPin,
};

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const Consultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'inProgress' | 'completed' | 'cancelled' | 'noShow'>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  const loadConsultations = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params: any = { 
        page, 
        limit: pagination.limit,
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      };
      
      if (search) params.search = search;
      if (filter !== 'all') params.status = filter;
      
      const response = await consultationsApi.getAll(params);
      
      // API returns { success, data: [...], pagination: {...} }
      const consultationsData = response.data || [];
      setConsultations(consultationsData);
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
      
      // Calculate stats from current page data
      const revenue = consultationsData.reduce((sum: number, c: Consultation) => sum + (c.amount || 0), 0);
      setStats(prev => ({
        ...prev,
        total: response.pagination?.total || consultationsData.length,
        totalRevenue: revenue
      }));
    } catch (err) {
      console.error('Failed to load consultations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, filter, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadConsultations(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadConsultations(newPage);
    }
  };

  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type as keyof typeof typeIcons] || Phone;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Consultations Management"
        subtitle={`Monitor all platform consultations • ${pagination.total} total`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="!p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{pagination.total}</p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">
                {consultations.filter(c => c.status === 'scheduled').length}
              </p>
              <p className="text-xs text-amber-600">Scheduled</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">
                {consultations.filter(c => c.status === 'inProgress').length}
              </p>
              <p className="text-xs text-yellow-600">In Progress</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {consultations.filter(c => c.status === 'completed').length}
              </p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">
                {consultations.filter(c => c.status === 'cancelled').length}
              </p>
              <p className="text-xs text-red-600">Cancelled</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-emerald-600">Page Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="noShow">No Show</option>
            </select>
          </div>
          <button
            onClick={() => loadConsultations(pagination.page)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading consultations..." />
          </div>
        ) : consultations.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No consultations found"
            description="No consultations match your current filters"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {consultations.map((consultation) => (
                    <tr key={consultation._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={consultation.clientName} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{consultation.clientName}</p>
                            <p className="text-sm text-gray-500">{consultation.clientPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {consultation.astrologerId ? (
                          <div className="flex items-center gap-3">
                            <Avatar 
                              src={consultation.astrologerId.profilePicture} 
                              name={consultation.astrologerId.name} 
                              size="sm" 
                            />
                            <div>
                              <p className="font-medium text-gray-900">{consultation.astrologerId.name}</p>
                              <p className="text-sm text-gray-500">{consultation.astrologerId.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium capitalize">
                          {getTypeIcon(consultation.type)}
                          {consultation.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{formatDateTime(consultation.scheduledTime)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">
                          {consultation.duration ? formatDuration(consultation.duration) : '-'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(consultation.amount, consultation.currency || 'INR')}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(consultation.status)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedConsultation(consultation)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} consultations
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedConsultation && (
        <ConsultationDetailModal
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </MainLayout>
  );
};

// Consultation Detail Modal Component
const ConsultationDetailModal = ({ 
  consultation, 
  onClose 
}: { 
  consultation: Consultation; 
  onClose: () => void;
}) => {
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        <config.icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-semibold text-gray-900">Consultation Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              {getStatusBadge(consultation.status)}
              <span className="text-sm text-gray-500">
                ID: {consultation._id.slice(-8)}
              </span>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Client Information</h3>
              <div className="flex items-center gap-4">
                <Avatar name={consultation.clientName} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">{consultation.clientName}</p>
                  <p className="text-sm text-gray-600">{consultation.clientPhone}</p>
                  {consultation.clientEmail && (
                    <p className="text-sm text-gray-600">{consultation.clientEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Astrologer Info */}
            {consultation.astrologerId && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-indigo-600 mb-3">Astrologer</h3>
                <div className="flex items-center gap-4">
                  <Avatar 
                    src={consultation.astrologerId.profilePicture}
                    name={consultation.astrologerId.name} 
                    size="lg" 
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{consultation.astrologerId.name}</p>
                    <p className="text-sm text-gray-600">{consultation.astrologerId.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Consultation Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Scheduled</span>
                </div>
                <p className="font-medium">{formatDateTime(consultation.scheduledTime)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="font-medium">{formatDuration(consultation.duration)} mins</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Amount</span>
                </div>
                <p className="font-medium text-lg">
                  {formatCurrency(consultation.amount, consultation.currency || 'INR')}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  {typeIcons[consultation.type as keyof typeof typeIcons] ? 
                    (() => { const Icon = typeIcons[consultation.type as keyof typeof typeIcons]; return <Icon className="w-4 h-4" />; })() :
                    <Phone className="w-4 h-4" />
                  }
                  <span className="text-sm">Type</span>
                </div>
                <p className="font-medium capitalize">{consultation.type}</p>
              </div>
            </div>

            {/* Ratings */}
            {(consultation.rating || consultation.astrologerRating) && (
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-amber-600 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Ratings & Feedback
                </h3>
                <div className="space-y-3">
                  {consultation.rating && (
                    <div>
                      <p className="text-sm text-gray-600">Client Rating</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < consultation.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{consultation.rating}/5</span>
                      </div>
                      {consultation.feedback && (
                        <p className="mt-1 text-sm text-gray-600 italic">"{consultation.feedback}"</p>
                      )}
                    </div>
                  )}
                  {consultation.astrologerRating && (
                    <div>
                      <p className="text-sm text-gray-600">Astrologer Rating</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < consultation.astrologerRating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{consultation.astrologerRating}/5</span>
                      </div>
                      {consultation.astrologerFeedback && (
                        <p className="mt-1 text-sm text-gray-600 italic">"{consultation.astrologerFeedback}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {consultation.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-700">{consultation.notes}</p>
              </div>
            )}

            {/* Status History */}
            {consultation.statusHistory && consultation.statusHistory.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Status History
                </h3>
                <div className="space-y-3">
                  {consultation.statusHistory.map((history, index) => (
                    <div 
                      key={history._id} 
                      className="flex items-start gap-3 relative"
                    >
                      {index < consultation.statusHistory!.length - 1 && (
                        <div className="absolute left-2 top-6 w-0.5 h-full bg-gray-200" />
                      )}
                      <div className="w-4 h-4 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-sm capitalize">{history.status}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(history.timestamp)}</p>
                        {history.notes && (
                          <p className="text-xs text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Source:</span> {consultation.source}
              </div>
              <div>
                <span className="font-medium">Reschedules:</span> {consultation.rescheduleCount}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDateTime(consultation.createdAt)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDateTime(consultation.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
