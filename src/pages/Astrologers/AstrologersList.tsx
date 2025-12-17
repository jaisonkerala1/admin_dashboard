import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, UserX } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, StatusBadge } from '@/components/common';
import { astrologersApi } from '@/api';
import { Astrologer } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';

export const AstrologersList = () => {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');

  useEffect(() => {
    loadAstrologers();
  }, [search, filter]);

  const loadAstrologers = async () => {
    try {
      setIsLoading(true);
      const response = await astrologersApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      let data: Astrologer[] = response.data || [];
      
      // The backend now returns properly formatted data with:
      // - specialization (mapped from specializations)
      // - rating (calculated from reviews)
      // - totalReviews (count of reviews)
      // - consultationCharge (mapped from ratePerMinute)
      // Just ensure defaults for any missing fields
      data = data.map((a: any) => ({
        ...a,
        specialization: a.specialization || a.specializations || [],
        rating: a.rating ?? 0,
        totalReviews: a.totalReviews ?? 0,
        consultationCharge: a.consultationCharge || a.ratePerMinute || 0,
        isApproved: a.isApproved ?? false,
        isSuspended: a.isSuspended ?? false,
      }));
      
      // Client-side filtering by status
      if (filter !== 'all') {
        data = data.filter(a => {
          if (filter === 'pending') return !a.isApproved && !a.isSuspended;
          if (filter === 'approved') return a.isApproved && !a.isSuspended;
          if (filter === 'suspended') return a.isSuspended;
          return true;
        });
      }
      
      setAstrologers(data);
    } catch (err) {
      console.error('Failed to load astrologers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatus = (astrologer: Astrologer) => {
    if (astrologer.isSuspended) return 'suspended';
    if (astrologer.isApproved) return 'approved';
    return 'pending';
  };

  return (
    <MainLayout>
      <PageHeader
        title="Astrologers Management"
        subtitle="Manage all astrologers on the platform"
      />

      <Card>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search astrologers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input w-48"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading astrologers..." />
          </div>
        ) : astrologers.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No astrologers found"
            description="No astrologers match your current filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Astrologer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charges</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {astrologers.map((astrologer) => (
                  <tr key={astrologer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link 
                        to={`/astrologers/${astrologer._id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <div className="relative">
                          <Avatar src={astrologer.profilePicture} name={astrologer.name} />
                          {astrologer.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{astrologer.name}</p>
                            {astrologer.isOnline && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{astrologer.experience} years exp</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{astrologer.email}</p>
                      <p className="text-sm text-gray-500">{astrologer.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(astrologer.specialization || []).slice(0, 2).map((spec, i) => (
                          <span key={i} className="badge bg-gray-100 text-gray-700">
                            {spec}
                          </span>
                        ))}
                        {(astrologer.specialization || []).length > 2 && (
                          <span className="badge bg-gray-100 text-gray-700">
                            +{(astrologer.specialization || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{(astrologer.rating || 0).toFixed(1)} ⭐</p>
                        <p className="text-sm text-gray-500">{astrologer.totalReviews || 0} reviews</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{formatCurrency(astrologer.consultationCharge || 0)}/min</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={getStatus(astrologer)} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-500">{formatRelativeTime(astrologer.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/astrologers/${astrologer._id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
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

