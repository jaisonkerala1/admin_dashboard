import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye, UserX, Users, UserCheck, Clock, XCircle, MessageCircle, Phone, Video } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, SearchBar } from '@/components/common';
import { astrologersApi } from '@/api';
import { Astrologer } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';

type FilterTab = 'all' | 'active' | 'pending' | 'inactive';

export const AstrologersList = () => {
  const navigate = useNavigate();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [entriesPerPage, setEntriesPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAstrologers();
  }, [search]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter, entriesPerPage]);

  const loadAstrologers = async () => {
    try {
      setIsLoading(true);
      const response = await astrologersApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      let data: Astrologer[] = response.data || [];
      
      // Ensure defaults for any missing fields
      data = data.map((a: any) => ({
        ...a,
        specialization: a.specialization || a.specializations || [],
        rating: a.rating ?? 0,
        totalReviews: a.totalReviews ?? 0,
        consultationCharge: a.consultationCharge || a.ratePerMinute || 0,
        isApproved: a.isApproved ?? false,
        isSuspended: a.isSuspended ?? false,
        isOnline: a.isOnline ?? false,
      }));
      
      setAstrologers(data);
    } catch (err) {
      console.error('Failed to load astrologers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter astrologers based on selected tab
  const filteredAstrologers = astrologers.filter(a => {
    if (filter === 'active') return a.isApproved && !a.isSuspended;
    if (filter === 'pending') return !a.isApproved && !a.isSuspended;
    if (filter === 'inactive') return a.isSuspended;
    return true; // 'all'
  });

  // Pagination
  const totalPages = Math.ceil(filteredAstrologers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedAstrologers = filteredAstrologers.slice(startIndex, endIndex);

  // Stats
  const stats = {
    total: astrologers.length,
    active: astrologers.filter(a => a.isApproved && !a.isSuspended).length,
    pending: astrologers.filter(a => !a.isApproved && !a.isSuspended).length,
    inactive: astrologers.filter(a => a.isSuspended).length,
  };

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
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={UserCheck}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pending}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={XCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
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
          <ShowEntriesDropdown value={entriesPerPage} onChange={setEntriesPerPage} />
          
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
                            <p className="font-semibold text-gray-900 text-base">{astrologer.name}</p>
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
                            <p className="font-semibold text-gray-900">{astrologer.name}</p>
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

            {/* Mobile Cards */}
            <div className="block sm:hidden space-y-4">
              {paginatedAstrologers.map((astrologer) => (
                <div 
                  key={astrologer._id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(astrologer._id)}
                      onChange={(e) => handleSelectOne(astrologer._id, e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <Link 
                      to={`/astrologers/${astrologer._id}`}
                      className="flex-1"
                    >
                      <div className="flex items-start gap-3">
                        <RoundAvatar 
                          src={astrologer.profilePicture} 
                          name={astrologer.name}
                          isOnline={astrologer.isOnline}
                          size="md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{astrologer.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">⭐ {(astrologer.rating || 0).toFixed(1)}</span>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm font-semibold text-gray-900">₹{astrologer.consultationCharge || 0}/min</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <PillBadge variant={getStatusVariant(astrologer)} label={getStatusLabel(astrologer)} />
                            {getApprovalBadge(astrologer)}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {(astrologer.specialization || []).slice(0, 2).join(', ')} • {astrologer.experience} years
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                    {/* Communication Button */}
                    <button
                      onClick={() => handleCommunication(astrologer, 'message')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send Message
                    </button>
                    
                    {/* Standard Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/astrologers/${astrologer._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAstrologers.length)} of {filteredAstrologers.length} entries
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
