import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, StatusBadge } from '@/components/common';
import { consultationsApi } from '@/api';
import { Consultation } from '@/types';
import { formatCurrency, formatDateTime, formatDuration } from '@/utils/formatters';

export const Consultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'ongoing' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadConsultations();
  }, [search, filter]);

  const loadConsultations = async () => {
    try {
      setIsLoading(true);
      const response = await consultationsApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      let data = response.data?.data || [];
      
      if (filter !== 'all') {
        data = data.filter(c => c.status === filter);
      }
      
      setConsultations(data);
    } catch (err) {
      console.error('Failed to load consultations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Consultations Management"
        subtitle="Monitor all platform consultations"
      />

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search consultations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input w-48"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Astrologer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consultations.map((consultation) => (
                  <tr key={consultation._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={consultation.userId.profilePicture} name={consultation.userId.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{consultation.userId.name}</p>
                          <p className="text-sm text-gray-500">{consultation.userId.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={consultation.astrologerId.profilePicture} name={consultation.astrologerId.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{consultation.astrologerId.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="badge bg-blue-100 text-blue-800 uppercase">{consultation.type}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {consultation.duration ? formatDuration(consultation.duration) : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{formatCurrency(consultation.amount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={consultation.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-500">{formatDateTime(consultation.createdAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </MainLayout>
  );
};

