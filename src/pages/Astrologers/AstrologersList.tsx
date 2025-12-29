import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye, UserX, Users, UserCheck, Clock, XCircle, MessageCircle, Phone, Video, BadgeCheck, TrendingUp, Star, DollarSign, MessageSquare, Calendar, User } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, SearchBar, SortDropdown, SortOption } from '@/components/common';
import { astrologersApi } from '@/api';
import { Astrologer } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';
import { socketService } from '@/services/socketService';

type FilterTab = 'all' | 'active' | 'pending' | 'inactive';

export const AstrologersList = () => {
  const navigate = useNavigate();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [entriesPerPage, setEntriesPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tabCounts, setTabCounts] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  });

  // Fetch dashboard stats for counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setTabCounts({
            total: result.data.astrologers.total,
            active: result.data.astrologers.active,
            pending: result.data.astrologers.pendingApprovals,
            inactive: result.data.astrologers.suspended,
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    loadAstrologers();
  }, [search, sortBy, sortOrder, filter, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search or filter changes
  }, [filter, search, entriesPerPage]);

  // Listen for real-time astrologer status changes
  useEffect(() => {
    const handleStatusChange = (data: { astrologerId: string; isOnline: boolean; lastSeen: string }) => {
      setAstrologers(prev => 
        prev.map(astrologer => 
          astrologer._id === data.astrologerId
            ? { ...astrologer, isOnline: data.isOnline, lastSeen: data.lastSeen }
            : astrologer
        )
      );
    };

    const unsubscribe = socketService.onAstrologerStatusChange(handleStatusChange);
    return () => unsubscribe();
  }, []);

  const loadAstrologers = async () => {
    try {
      setIsLoading(true);
      const response = await astrologersApi.getAll({ 
        search, 
        sortBy, 
        sortOrder,
        status: filter !== 'all' ? filter : undefined,
        page: currentPage,
        limit: entriesPerPage
      } as any);
      
      let data: Astrologer[] = response.data || [];
      
      // Ensure defaults for any missing fields
      data = data.map((a: any) => ({
        ...a,
        specialization: a.specialization || a.specializations || [],
        rating: a.rating ?? 0,
        totalReviews: a.totalReviews ?? 0,
        totalConsultations: a.totalConsultations ?? 0,
        consultationCharge: a.consultationCharge || a.ratePerMinute || 0,
        isApproved: a.isApproved ?? false,
        isVerified: a.isVerified ?? false,
        isSuspended: a.isSuspended ?? false,
        isOnline: a.isOnline ?? false,
      }));
      
      setAstrologers(data);
      if (response.pagination) {
        setTotalEntries(response.pagination.total);
      } else {
        setTotalEntries(data.length);
      }
    } catch (err) {
      console.error('Failed to load astrologers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Stats are now from tabCounts
  const stats = {
    total: tabCounts.total,
    active: tabCounts.active,
    pending: tabCounts.pending,
    inactive: tabCounts.inactive,
  };

  // Pagination calculation from server data
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + astrologers.length;
  const paginatedAstrologers = astrologers; // Already paginated by server

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedAstrologers.map(a => a._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = paginatedAstrologers.length > 0 && paginatedAstrologers.every(a => selectedIds.has(a._id));
  const isSomeSelected = paginatedAstrologers.some(a => selectedIds.has(a._id)) && !isAllSelected;

  // Sort options for performance metrics
  const sortOptions: SortOption[] = [
    { value: 'totalEarnings-desc', label: 'Highest Earnings', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'totalEarnings-asc', label: 'Lowest Earnings', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'rating-desc', label: 'Highest Rating', icon: <Star className="w-4 h-4" /> },
    { value: 'rating-asc', label: 'Lowest Rating', icon: <Star className="w-4 h-4" /> },
    { value: 'totalReviews-desc', label: 'Most Reviews', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'totalReviews-asc', label: 'Least Reviews', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'totalConsultations-desc', label: 'Most Consultations', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'totalConsultations-asc', label: 'Least Consultations', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'experience-desc', label: 'Most Experience', icon: <User className="w-4 h-4" /> },
    { value: 'experience-asc', label: 'Least Experience', icon: <User className="w-4 h-4" /> },
    { value: 'name-asc', label: 'Name (A-Z)', icon: <User className="w-4 h-4" /> },
    { value: 'name-desc', label: 'Name (Z-A)', icon: <User className="w-4 h-4" /> },
    { value: 'createdAt-desc', label: 'Newest First', icon: <Calendar className="w-4 h-4" /> },
    { value: 'createdAt-asc', label: 'Oldest First', icon: <Calendar className="w-4 h-4" /> },
  ];

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order as 'asc' | 'desc');
  };

  const currentSortValue = `${sortBy}-${sortOrder}`;

  const getStatusVariant = (astrologer: Astrologer): 'online' | 'offline' | 'busy' | 'inactive' => {
    if (astrologer.isSuspended) return 'inactive';
    if (astrologer.isOnline) return 'online';
    return 'offline';
  };

  const getStatusLabel = (astrologer: Astrologer): string => {
    if (astrologer.isSuspended) return 'Inactive';
    if (astrologer.isOnline) return 'Online';
    if (astrologer.lastSeen) {
      return `Last seen ${formatRelativeTime(astrologer.lastSeen)}`;
    }
    return 'Offline';
  };

  const getApprovalBadge = (astrologer: Astrologer) => {
    if (!astrologer.isApproved) {
      return <PillBadge variant="pending" label="Pending Approval" showDot={false} />;
    }
    return null;
  };

  // Communication helper
  const handleCommunication = (astrologer: Astrologer, action: 'message' | 'voice_call' | 'video_call') => {
    navigate('/communication', {
      state: {
        selectedAstrologerId: astrologer._id,
        action
      }
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Astrologers</h1>
            <p className="text-gray-500 mt-1">Manage all astrologers on the platform</p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-80">
            <SearchBar
              placeholder="Search name, email, or etc..."
              value={search}
              onSearch={(query) => setSearch(query)}
              onClear={() => setSearch('')}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Users}
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={UserCheck}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pending}
            icon={Clock}
            />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={XCircle}
          />
        </div>
          </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'active', label: 'Active', count: stats.active },
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'inactive', label: 'Inactive', count: stats.inactive },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterTab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} <span className="text-sm">({tab.count})</span>
            </button>
          ))}
          </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ShowEntriesDropdown value={entriesPerPage} onChange={setEntriesPerPage} />
            <SortDropdown
              options={sortOptions}
              value={currentSortValue}
              onChange={handleSortChange}
            />
          </div>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
              <button className="btn btn-sm btn-primary">Approve</button>
              <button className="btn btn-sm btn-danger">Deactivate</button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="btn btn-sm"
              >
                Deselect
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading astrologers..." />
          </div>
        ) : paginatedAstrologers.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No astrologers found"
            description="No astrologers match your current filters"
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-gray-200">
                <tr>
                    <th className="px-4 py-3 text-left w-12">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reviews</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Charges</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
                <tbody>
                  {paginatedAstrologers.map((astrologer) => (
                    <tr 
                      key={astrologer._id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(astrologer._id)}
                          onChange={(e) => handleSelectOne(astrologer._id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    <td className="px-4 py-4">
                        <Link 
                          to={`/astrologers/${astrologer._id}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <RoundAvatar 
                            src={astrologer.profilePicture} 
                            name={astrologer.name}
                            isOnline={astrologer.isOnline}
                            size="md"
                          />
                        <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-900 text-base">{astrologer.name}</p>
                              {astrologer.isVerified && (
                                <BadgeCheck className="w-4 h-4 text-white fill-[#1877F2] flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{astrologer.name.split(' ')[0]}</p>
                        </div>
                        </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{astrologer.email}</p>
                      <p className="text-sm text-gray-500">{astrologer.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <PillBadge variant={getStatusVariant(astrologer)} label={getStatusLabel(astrologer)} />
                          {getApprovalBadge(astrologer)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">⭐</span>
                      <div>
                            <p className="font-semibold text-gray-900">{(astrologer.rating || 0).toFixed(1)}</p>
                            <p className="text-xs text-gray-500">{astrologer.totalReviews || 0} reviews</p>
                          </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">₹{astrologer.consultationCharge || 0}</p>
                        <p className="text-xs text-gray-500">per minute</p>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {(astrologer.specialization || []).slice(0, 2).join(', ')}
                          </p>
                          <p className="text-sm text-gray-500">{astrologer.experience} years exp</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Communication Actions */}
                          <button
                            onClick={() => handleCommunication(astrologer, 'message')}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Send Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCommunication(astrologer, 'voice_call')}
                            disabled={!astrologer.isOnline}
                            className={`p-2 rounded-lg transition-colors ${
                              astrologer.isOnline
                                ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={astrologer.isOnline ? 'Voice Call' : 'Offline'}
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCommunication(astrologer, 'video_call')}
                            disabled={!astrologer.isOnline}
                            className={`p-2 rounded-lg transition-colors ${
                              astrologer.isOnline
                                ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={astrologer.isOnline ? 'Video Call' : 'Offline'}
                          >
                            <Video className="w-4 h-4" />
                          </button>
                          
                          {/* Separator */}
                          <div className="w-px h-6 bg-gray-200 mx-1" />
                          
                          {/* Standard Actions */}
                          <Link
                            to={`/astrologers/${astrologer._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="hidden sm:block lg:hidden">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reviews</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAstrologers.map((astrologer) => (
                    <tr 
                      key={astrologer._id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(astrologer._id)}
                          onChange={(e) => handleSelectOne(astrologer._id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Link 
                          to={`/astrologers/${astrologer._id}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <RoundAvatar 
                            src={astrologer.profilePicture} 
                            name={astrologer.name}
                            isOnline={astrologer.isOnline}
                            size="sm"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-900">{astrologer.name}</p>
                              {astrologer.isVerified && (
                                <BadgeCheck className="w-4 h-4 text-white fill-[#1877F2] flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {(astrologer.specialization || []).slice(0, 1).join(', ')} • {astrologer.experience} years
                            </p>
                            <p className="text-xs text-gray-500">₹{astrologer.consultationCharge || 0}/min</p>
                          </div>
                        </Link>
                    </td>
                    <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">⭐</span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{(astrologer.rating || 0).toFixed(1)}</p>
                            <p className="text-xs text-gray-500">{astrologer.totalReviews || 0}</p>
                          </div>
                        </div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <PillBadge variant={getStatusVariant(astrologer)} label={getStatusLabel(astrologer)} />
                          {getApprovalBadge(astrologer)}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Communication */}
                          <button
                            onClick={() => handleCommunication(astrologer, 'message')}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          
                          {/* Separator */}
                          <div className="w-px h-6 bg-gray-200 mx-1" />
                          
                          {/* Standard Actions */}
                      <Link
                        to={`/astrologers/${astrologer._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Mobile Cards - Compact Mobile Design */}
            <div className="block sm:hidden space-y-2">
              {paginatedAstrologers.map((astrologer) => (
                <div 
                  key={astrologer._id}
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden hover:border-gray-300 active:bg-gray-50 transition-all"
                >
                  {/* Compact Header Section */}
                  <div className="p-2.5">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(astrologer._id)}
                        onChange={(e) => handleSelectOne(astrologer._id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
                      />
                      
                      <Link 
                        to={`/astrologers/${astrologer._id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <RoundAvatar 
                            src={astrologer.profilePicture} 
                            name={astrologer.name}
                            isOnline={astrologer.isOnline}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="font-semibold text-sm text-gray-900 truncate">{astrologer.name}</h3>
                              {astrologer.isVerified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-white fill-[#1877F2] flex-shrink-0" />
                              )}
                              {getApprovalBadge(astrologer)}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="text-xs text-gray-600">⭐ {(astrologer.rating || 0).toFixed(1)}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs font-medium text-gray-900">₹{astrologer.consultationCharge || 0}/min</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-600">{astrologer.experience}y</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <PillBadge variant={getStatusVariant(astrologer)} label={getStatusLabel(astrologer)} className="text-xs" />
                              <p className="text-xs text-gray-500 truncate">
                                {(astrologer.specialization || []).slice(0, 2).join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Compact Actions - Minimal Icons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommunication(astrologer, 'message');
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-md transition-colors touch-manipulation"
                          title="Message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/astrologers/${astrologer._id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-md transition-colors touch-manipulation"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!isLoading && paginatedAstrologers.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
            </p>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &lt;
              </button>
              
              {getPaginationNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-500">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </Card>
    </MainLayout>
  );
};
