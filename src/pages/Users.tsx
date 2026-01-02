import { useEffect, useState } from 'react';
import { Search, Filter, Ban, CheckCircle } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, StatusBadge, Modal, SearchBar } from '@/components/common';
import { usersApi } from '@/api';
import { User } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [search, filter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      let data = response.data?.data || [];
      
      if (filter !== 'all') {
        data = data.filter(u => filter === 'banned' ? u.isBanned : !u.isBanned);
      }
      
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async () => {
    if (!selectedUser || !banReason.trim()) return;
    try {
      setIsProcessing(true);
      await usersApi.ban(selectedUser._id, { reason: banReason });
      setShowBanModal(false);
      setBanReason('');
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error('Failed to ban user:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await usersApi.unban(userId);
      await loadUsers();
    } catch (err) {
      console.error('Failed to unban user:', err);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Users Management"
        subtitle="Manage all platform users"
      />

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder="Search users..."
              value={search}
              onSearch={(query) => setSearch(query)}
              onClear={() => setSearch('')}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input w-48"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No users found"
            description="No users match your current filters"
          />
        ) : users.length > 50 ? (
          // Use virtual scrolling for large lists (>50 items)
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table header */}
              <div className="grid grid-cols-7 gap-4 bg-gray-50 border-y border-gray-200 px-4 py-3">
                <div className="text-left text-xs font-medium text-gray-500 uppercase">User</div>
                <div className="text-left text-xs font-medium text-gray-500 uppercase">Contact</div>
                <div className="text-left text-xs font-medium text-gray-500 uppercase">Consultations</div>
                <div className="text-left text-xs font-medium text-gray-500 uppercase">Total Spent</div>
                <div className="text-left text-xs font-medium text-gray-500 uppercase">Status</div>
                <div className="text-left text-xs font-medium text-gray-500 uppercase">Last Active</div>
                <div className="text-right text-xs font-medium text-gray-500 uppercase">Actions</div>
              </div>
              {/* Virtualized table body */}
              <List
                height={Math.min(600, users.length * 72)}
                itemCount={users.length}
                itemSize={72}
                width="100%"
                overscanCount={5}
              >
                {({ index, style }) => {
                  const user = users[index];
                  return (
                    <div style={style} className="border-b border-gray-200 hover:bg-gray-50">
                      <div className="grid grid-cols-7 gap-4 px-4 py-4 items-center">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.profilePicture} name={user.name} />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.totalConsultations}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(user.totalSpent)}</p>
                        </div>
                        <div>
                          {user.isBanned ? (
                            <StatusBadge status="banned" />
                          ) : (
                            <StatusBadge status="active" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{formatRelativeTime(user.lastActiveAt)}</p>
                        </div>
                        <div className="text-right">
                          {user.isBanned ? (
                            <button
                              onClick={() => handleUnban(user._id)}
                              className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBanModal(true);
                              }}
                              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              <Ban className="w-4 h-4" />
                              Ban
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              </List>
            </div>
          </div>
        ) : (
          // Regular table for smaller lists (≤50 items)
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultations</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.profilePicture} name={user.name} />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{user.totalConsultations}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{formatCurrency(user.totalSpent)}</p>
                    </td>
                    <td className="px-4 py-4">
                      {user.isBanned ? (
                        <StatusBadge status="banned" />
                      ) : (
                        <StatusBadge status="active" />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-500">{formatRelativeTime(user.lastActiveAt)}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUnban(user._id)}
                          className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          <Ban className="w-4 h-4" />
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setSelectedUser(null);
          setBanReason('');
        }}
        title="Ban User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for banning <strong>{selectedUser.name}</strong>:
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="input min-h-[120px] resize-none"
              placeholder="Enter ban reason..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBanModal(false)}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={!banReason.trim() || isProcessing}
                className="btn btn-danger btn-md"
              >
                {isProcessing ? 'Banning...' : 'Ban User'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

