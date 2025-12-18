import { useState, useEffect } from 'react';
import { MessageCircle, Search, Loader2 } from 'lucide-react';
import { ChatWindow, VideoCallWindow } from '@/components/communication';
import { RoundAvatar } from '@/components/common/RoundAvatar';
import { PillBadge } from '@/components/common/PillBadge';
import { socketService } from '@/services/socketService';
import { astrologersApi } from '@/api/astrologers';
import type { Astrologer } from '@/types';
import type { Call } from '@/types/communication';

export const Communication = () => {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [filteredAstrologers, setFilteredAstrologers] = useState<Astrologer[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAstrologers();
    socketService.connect();

    // Listen for incoming calls
    const unsubscribe = socketService.onCall((call) => {
      if (call.status === 'accepted') {
        setActiveCall(call);
      }
    });

    // Listen for incoming messages to update unread badge on list
    const unsubscribeMessages = socketService.onMessage((message) => {
      const astroId =
        message.senderType === 'astrologer'
          ? message.senderId
          : message.recipientType === 'astrologer'
            ? message.recipientId
            : undefined;

      if (!astroId) return;

      setUnreadCounts((prev) => {
        // If this conversation is currently open, do not increment
        if (selectedAstrologer?._id === astroId) {
          return { ...prev, [astroId]: 0 };
        }
        const current = prev[astroId] ?? 0;
        return { ...prev, [astroId]: current + 1 };
      });
    });

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, [selectedAstrologer]);

  useEffect(() => {
    filterAstrologers();
  }, [astrologers, searchQuery, filterStatus]);

  const loadAstrologers = async () => {
    try {
      setIsLoading(true);
      const response = await astrologersApi.getAll();
      const data = response.data || [];
      
      // Sort by online status first, then by name
      const sorted = data.sort((a, b) => {
        if (a.isOnline === b.isOnline) {
          return a.name.localeCompare(b.name);
        }
        return a.isOnline ? -1 : 1;
      });
      
      setAstrologers(sorted);

      // Pre-join all conversations so incoming messages trigger badges
      try {
        await socketService.connectAndWait();
        const nextJoined = new Set(joinedRooms);
        sorted.forEach((astro) => {
          const convoId = `admin_${astro._id}`;
          if (!nextJoined.has(convoId)) {
            socketService.joinConversation(convoId);
            nextJoined.add(convoId);
          }
        });
        setJoinedRooms(nextJoined);
      } catch (e) {
        console.error('Failed to pre-join conversation rooms:', e);
      }
    } catch (error) {
      console.error('Failed to load astrologers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAstrologers = () => {
    let filtered = astrologers;

    // Filter by status
    if (filterStatus === 'online') {
      filtered = filtered.filter(a => a.isOnline);
    } else if (filterStatus === 'offline') {
      filtered = filtered.filter(a => !a.isOnline);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.phone.includes(query)
      );
    }

    setFilteredAstrologers(filtered);
  };

  const handleSelectAstrologer = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setUnreadCounts((prev) => ({ ...prev, [astrologer._id]: 0 }));
  };

  const handleCall = (type: 'voice' | 'video') => {
    if (!selectedAstrologer) return;

    socketService.initiateCall({
      recipientId: selectedAstrologer._id,
      recipientType: 'astrologer',
      callType: type,
    });
  };

  const handleEndCall = () => {
    if (activeCall) {
      socketService.endCall(activeCall._id);
      setActiveCall(null);
    }
  };

  if (activeCall && selectedAstrologer) {
    return (
      <VideoCallWindow
        astrologer={selectedAstrologer}
        channelName={activeCall.channelName}
        agoraToken={activeCall.agoraToken || ''}
        callType={activeCall.callType}
        onEnd={handleEndCall}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Sidebar - Astrologer List */}
      <div className={`${
        selectedAstrologer ? 'hidden lg:flex' : 'flex'
      } w-full lg:w-96 flex-col bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Communication</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search astrologers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({astrologers.length})
            </button>
            <button
              onClick={() => setFilterStatus('online')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'online'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Online ({astrologers.filter(a => a.isOnline).length})
            </button>
            <button
              onClick={() => setFilterStatus('offline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'offline'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Offline ({astrologers.filter(a => !a.isOnline).length})
            </button>
          </div>
        </div>

        {/* Astrologer List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : filteredAstrologers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">No astrologers found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAstrologers.map((astrologer) => (
                <button
                  key={astrologer._id}
                  onClick={() => handleSelectAstrologer(astrologer)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedAstrologer?._id === astrologer._id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <RoundAvatar
                    src={astrologer.profilePicture}
                    name={astrologer.name}
                    size="md"
                    isOnline={astrologer.isOnline}
                  />
                  
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{astrologer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <PillBadge
                        variant={astrologer.isActive ? 'active' : 'inactive'}
                      />
                      {astrologer.isOnline && (
                        <span className="text-xs text-green-600 font-medium">● Online</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                    {(unreadCounts[astrologer._id] ?? 0) > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                        {unreadCounts[astrologer._id]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${
        selectedAstrologer ? 'flex' : 'hidden lg:flex'
      } flex-1 flex-col`}>
        {selectedAstrologer ? (
          <ChatWindow
            astrologer={selectedAstrologer}
            onBack={() => setSelectedAstrologer(null)}
            onCall={handleCall}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select an astrologer to start chatting</p>
              <p className="text-sm mt-2">
                Choose from the list to send messages or make calls
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

