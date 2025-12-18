import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Loader2 } from 'lucide-react';
import { ChatWindow, VideoCallWindow } from '@/components/communication';
import { IncomingCallModal } from '@/components/communication/IncomingCallModal';
import { RoundAvatar } from '@/components/common/RoundAvatar';
import { PillBadge } from '@/components/common/PillBadge';
import { socketService } from '@/services/socketService';
import { astrologersApi } from '@/api/astrologers';
import type { Astrologer } from '@/types';
import type { Call } from '@/types/communication';

export const Communication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [filteredAstrologers, setFilteredAstrologers] = useState<Astrologer[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());
  const [lastActivity, setLastActivity] = useState<Record<string, number>>({});

  useEffect(() => {
    console.log('🚀 Communication page mounted');
    
    // Safety timeout: force stop loading after 10 seconds
    const loadingTimeout = setTimeout(() => {
      console.error('⏰ Loading timeout - forcing stop');
      setIsLoading(false);
    }, 10000);

    loadAstrologers();
    socketService.connect();

    // Listen for incoming calls
    const unsubscribeIncoming = socketService.onIncomingCall((call) => {
      console.log('📞 Incoming call received in Communication.tsx:', call);
      setIncomingCall({
        ...call,
        callerName: call.callerName || 'Unknown',
        callerAvatar: call.callerAvatar,
      });
    });

    // Listen for call accepted events
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

      // Track last activity timestamp for sorting (newest first)
      const ts =
        typeof message.timestamp === 'string'
          ? Date.parse(message.timestamp)
          : message.timestamp instanceof Date
            ? message.timestamp.getTime()
            : Date.now();

      setLastActivity((prev) => ({ ...prev, [astroId]: ts || Date.now() }));
      
      // Update unread count (will be cleared when that conversation is selected)
      setUnreadCounts((prev) => {
        const current = prev[astroId] ?? 0;
        return { ...prev, [astroId]: current + 1 };
      });
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
      unsubscribeIncoming();
      unsubscribeMessages();
    };
  }, []); // Run only once on mount

  useEffect(() => {
    filterAstrologers();
  }, [astrologers, searchQuery, filterStatus, lastActivity]);

  // Handle pre-selection from navigation state (from profile page)
  useEffect(() => {
    if (!location.state?.selectedAstrologerId || astrologers.length === 0) return;

    const preSelectedAstrologer = astrologers.find(
      a => a._id === location.state.selectedAstrologerId
    );

    if (preSelectedAstrologer) {
      console.log('📍 Pre-selecting astrologer from profile:', preSelectedAstrologer.name);
      setSelectedAstrologer(preSelectedAstrologer);
      setUnreadCounts((prev) => ({ ...prev, [preSelectedAstrologer._id]: 0 }));
      setLastActivity((prev) => ({ ...prev, [preSelectedAstrologer._id]: Date.now() }));

      // Handle the requested action
      const action = location.state.action;
      if (action === 'voice_call' && preSelectedAstrologer.isOnline) {
        console.log('📞 Auto-initiating voice call...');
        setTimeout(() => handleCall('voice'), 500); // Small delay to ensure chat window is ready
      } else if (action === 'video_call' && preSelectedAstrologer.isOnline) {
        console.log('📹 Auto-initiating video call...');
        setTimeout(() => handleCall('video'), 500);
      } else if (action === 'voice_call' || action === 'video_call') {
        console.warn('⚠️ Cannot initiate call - astrologer is offline');
      }
      // For 'message' action, just opening the chat window is enough (default behavior)

      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [astrologers, location.state]);

  const loadAstrologers = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading astrologers...');
      
      // Call API with params like Astrologers page does
      const response = await astrologersApi.getAll({ 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });
      console.log('✅ Astrologers loaded:', response.data?.length || 0);
      
      const data = response.data || [];
      
      // Sort by online status first, then by name
      const sorted = data.sort((a, b) => {
        if (a.isOnline === b.isOnline) {
          return a.name.localeCompare(b.name);
        }
        return a.isOnline ? -1 : 1;
      });
      
      setAstrologers(sorted);
      setIsLoading(false); // Stop loading spinner NOW
      console.log('✅ Astrologers list ready');

      // Pre-join rooms AFTER showing the list (non-blocking)
      if (sorted.length > 0) {
        console.log('🔌 Pre-joining conversation rooms in background...');
        // Don't await this - let it happen in background
        socketService.connectAndWait(2000)
          .then(() => {
            sorted.forEach((astro) => {
              const convoId = `admin_${astro._id}`;
              if (!joinedRooms.has(convoId)) {
                socketService.joinConversation(convoId);
                setJoinedRooms((prev) => new Set([...prev, convoId]));
              }
            });
            console.log(`✅ Pre-joined ${sorted.length} conversation rooms`);
          })
          .catch((e) => {
            console.warn('⚠️ Failed to pre-join conversation rooms (non-critical):', e);
          });
      }
    } catch (error) {
      console.error('❌ Failed to load astrologers:', error);
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

    // Sort by online -> last activity desc -> name
    filtered = [...filtered].sort((a, b) => {
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      const la = lastActivity[a._id] ?? 0;
      const lb = lastActivity[b._id] ?? 0;
      if (la !== lb) {
        return lb - la;
      }
      return a.name.localeCompare(b.name);
    });

    setFilteredAstrologers(filtered);
  };

  const handleSelectAstrologer = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setUnreadCounts((prev) => ({ ...prev, [astrologer._id]: 0 }));
    // Mark last activity to "now" when opened so it stays near top until new events arrive
    setLastActivity((prev) => ({ ...prev, [astrologer._id]: Date.now() }));
  };

  const handleCall = (type: 'voice' | 'video') => {
    if (!selectedAstrologer) return;

    // Listen for call:token response (one-time)
    const unsubscribeToken = socketService.onCallToken((data) => {
      console.log('🔑 Call token received:', data);
      
      // Set up active call with token data
      setActiveCall({
        _id: data.callId,
        callerId: 'admin',
        callerType: 'admin',
        recipientId: selectedAstrologer._id,
        recipientType: 'astrologer',
        callType: type,
        channelName: data.channelName,
        agoraToken: data.agoraToken,
        status: 'initiated',
        startedAt: new Date(),
      });

      // Clean up listener
      unsubscribeToken();
    });

    // Initiate the call
    socketService.initiateCall({
      recipientId: selectedAstrologer._id,
      recipientType: 'astrologer',
      callType: type,
    });

    console.log(`📞 Initiating ${type} call to ${selectedAstrologer.name}`);
  };

  const handleEndCall = () => {
    if (activeCall) {
      socketService.endCall(activeCall._id);
      setActiveCall(null);
    }
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;

    // Emit call:accept
    socketService.acceptCall(incomingCall.callId, incomingCall.callerId);

    // Find the astrologer and select them
    const caller = astrologers.find(a => a._id === incomingCall.callerId);
    if (caller) {
      setSelectedAstrologer(caller);
    }

    // Set up active call with incoming call data
    setActiveCall({
      _id: incomingCall.callId,
      callerId: incomingCall.callerId,
      callerType: 'astrologer',
      recipientId: 'admin',
      recipientType: 'admin',
      callType: incomingCall.callType,
      channelName: incomingCall.channelName,
      agoraToken: incomingCall.agoraToken,
      status: 'accepted',
      startedAt: new Date(),
    });

    setIncomingCall(null);
  };

  const handleRejectIncomingCall = () => {
    if (!incomingCall) return;

    // Emit call:reject
    socketService.rejectCall(incomingCall.callId, 'declined');

    setIncomingCall(null);
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

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          onAccept={handleAcceptIncomingCall}
          onReject={handleRejectIncomingCall}
        />
      )}
    </div>
  );
};

