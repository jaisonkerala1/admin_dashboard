import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Loader2, Home } from 'lucide-react';
import { ChatWindow, VideoCallWindow } from '@/components/communication';
import { IncomingCallModal } from '@/components/communication/IncomingCallModal';
import { OutgoingCallModal } from '@/components/communication/OutgoingCallModal';
import { RoundAvatar, SearchBar } from '@/components/common';
import { PillBadge } from '@/components/common/PillBadge';
import { socketService } from '@/services/socketService';
import { astrologersApi } from '@/api/astrologers';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Astrologer } from '@/types';
import type { Call } from '@/types/communication';

export const Communication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { markAsRead, unreadByAstrologer } = useNotifications();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [filteredAstrologers, setFilteredAstrologers] = useState<Astrologer[]>([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // WhatsApp-like call state:
  // - outgoingCall: we initiated and we're waiting for accept (ringing)
  // - activeCall: accepted/in-call (Agora window)
  const [outgoingCall, setOutgoingCall] = useState<Call | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  // Use global unread counts from NotificationContext
  const [localUnreadCounts, setLocalUnreadCounts] = useState<Record<string, number>>({});
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());
  const [lastActivity, setLastActivity] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, { content: string; isOwn: boolean }>>({}); 

  // Merge global unread counts with local counts
  const unreadCounts = { ...localUnreadCounts, ...unreadByAstrologer };

  // Mark messages as read when selecting an astrologer
  useEffect(() => {
    if (selectedAstrologer) {
      markAsRead(selectedAstrologer._id);
      // Also clear local unread count
      setLocalUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[selectedAstrologer._id];
        return newCounts;
      });
    }
  }, [selectedAstrologer, markAsRead]);

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
    const unsubscribeAccept = socketService.onCallAccept((data) => {
      console.log('✅ [COMMUNICATION] Call accepted:', data);
      setOutgoingCall((current: Call | null) => {
        if (!current || current._id !== data.callId) return current;

        // Transition to in-call window (Agora)
        setActiveCall({
          ...current,
          status: 'accepted',
          agoraToken: data.agoraToken ?? current.agoraToken,
          channelName: data.channelName ?? current.channelName,
        });
        return null;
      });
    });

    // Listen for call ended/rejected events (when astrologer ends or declines the call)
    const unsubscribeCallEnd = socketService.onCallEnd((callId) => {
      console.log('📴 [COMMUNICATION] Call ended/rejected remotely:', callId);
      // Clear outgoing ringing UI if it matches
      setOutgoingCall((current: Call | null) => (current?._id === callId ? null : current));

      // Clear active call UI if it matches
      setActiveCall((current: Call | null) => (current?._id === callId ? null : current));

      // Clear incoming call modal if caller cancels before we answer
      setIncomingCall((current: any | null) => (current?.callId === callId ? null : current));
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
      
      // Store last message preview
      setLastMessages((prev) => ({
        ...prev,
        [astroId]: {
          content: message.content,
          isOwn: message.senderType === 'admin'
        }
      }));
      
      // Only increment unread count if message is FROM astrologer (not our own messages)
      if (message.senderType === 'astrologer') {
        setLocalUnreadCounts((prev) => {
          const current = prev[astroId] ?? 0;
          return { ...prev, [astroId]: current + 1 };
        });
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribeAccept();
      unsubscribeIncoming();
      unsubscribeCallEnd();
      unsubscribeMessages();
    };
  }, []); // Run only once on mount

  useEffect(() => {
    filterAstrologers();
  }, [astrologers, searchQuery, filterStatus, lastActivity, unreadCounts]);

  // Handle pre-selection from navigation state (from profile page) or URL query parameter
  useEffect(() => {
    if (astrologers.length === 0) return;

    // Check for astrologerId in URL query parameter (from Dashboard message button)
    const searchParams = new URLSearchParams(location.search);
    const astrologerIdFromQuery = searchParams.get('astrologerId');
    
    // Check for astrologerId in location state (from profile page)
    const astrologerIdFromState = location.state?.selectedAstrologerId;
    
    // Use query parameter first, then state
    const astrologerId = astrologerIdFromQuery || astrologerIdFromState;
    
    if (!astrologerId) return;

    const preSelectedAstrologer = astrologers.find(
      a => a._id === astrologerId
    );

    if (preSelectedAstrologer) {
      console.log('📍 Pre-selecting astrologer:', preSelectedAstrologer.name);
      setSelectedAstrologer(preSelectedAstrologer);
      setLocalUnreadCounts((prev) => ({ ...prev, [preSelectedAstrologer._id]: 0 }));
      setLastActivity((prev) => ({ ...prev, [preSelectedAstrologer._id]: Date.now() }));

      // Handle the requested action (only from state, not from query param)
      const action = location.state?.action;
      if (action === 'voice_call' && preSelectedAstrologer.isOnline) {
        console.log('📞 Auto-initiating voice call...');
        setTimeout(() => handleCall('voice'), 500); // Small delay to ensure chat window is ready
      } else if (action === 'video_call' && preSelectedAstrologer.isOnline) {
        console.log('📹 Auto-initiating video call...');
        setTimeout(() => handleCall('video'), 500);
      } else if (action === 'voice_call' || action === 'video_call') {
        console.warn('⚠️ Cannot initiate call - astrologer is offline');
      }
      // For 'message' action or query param, just opening the chat window is enough (default behavior)

      // Clear the query parameter and navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [astrologers, location.state, location.search]);

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

    // Sort: unread → online → last activity desc → name
    filtered = [...filtered].sort((a, b) => {
      // 1. Unread messages first (most important)
      const unreadA = unreadCounts[a._id] ?? 0;
      const unreadB = unreadCounts[b._id] ?? 0;
      if (unreadA > 0 && unreadB === 0) return -1;
      if (unreadB > 0 && unreadA === 0) return 1;
      
      // 2. Online status
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      
      // 3. Last activity (most recent first)
      const la = lastActivity[a._id] ?? 0;
      const lb = lastActivity[b._id] ?? 0;
      if (la !== lb) {
        return lb - la;
      }
      
      // 4. Alphabetical by name
      return a.name.localeCompare(b.name);
    });

    setFilteredAstrologers(filtered);
  };

  const handleSelectAstrologer = (astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    setLocalUnreadCounts((prev) => ({ ...prev, [astrologer._id]: 0 }));
    // Mark last activity to "now" when opened so it stays near top until new events arrive
    setLastActivity((prev) => ({ ...prev, [astrologer._id]: Date.now() }));
  };

  // Format last message preview
  const getLastMessagePreview = (astrologerId: string): string => {
    const lastMsg = lastMessages[astrologerId];
    if (!lastMsg) return 'No messages yet';
    
    const prefix = lastMsg.isOwn ? 'You: ' : '';
    const truncated = lastMsg.content.length > 40 
      ? lastMsg.content.substring(0, 40) + '...' 
      : lastMsg.content;
    
    return prefix + truncated;
  };

  const handleCall = (type: 'voice' | 'video') => {
    if (!selectedAstrologer) return;

    // Listen for call:token response (one-time)
    const unsubscribeToken = socketService.onCallToken((data) => {
      console.log('🔑 Call token received:', data);
      
      // Set up OUTGOING call (ringing) with token data.
      // We only open Agora window after `call:accept` arrives.
      setOutgoingCall({
        _id: data.callId,
        callerId: 'admin',
        callerType: 'admin',
        recipientId: selectedAstrologer._id,
        recipientType: 'astrologer',
        callType: type,
        channelName: data.channelName,
        agoraToken: data.agoraToken,
        status: 'ringing',
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

  const handleEndCall = (duration?: number) => {
    // End active (in-call)
    if (activeCall) {
      const callDuration = duration ?? (activeCall.startedAt ? Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000) : 0);
      const contactId = activeCall.recipientId || activeCall.callerId;

      console.log(`📴 [COMMUNICATION] Ending ACTIVE call ${activeCall._id} with ${contactId} (duration: ${callDuration}s)`);
      if (activeCall._id) {
        socketService.endCall(activeCall._id, {
          contactId,
          duration: callDuration,
          endReason: 'completed',
        });
      }
      setActiveCall(null);
      return;
    }

    // Cancel outgoing (ringing) before it's answered
    if (outgoingCall) {
      const callDuration = duration ?? (outgoingCall.startedAt ? Math.floor((Date.now() - outgoingCall.startedAt.getTime()) / 1000) : 0);
      const contactId = outgoingCall.recipientId;

      console.log(`📴 [COMMUNICATION] Cancelling OUTGOING call ${outgoingCall._id} to ${contactId} (duration: ${callDuration}s)`);
      if (outgoingCall._id) {
        socketService.endCall(outgoingCall._id, {
          contactId,
          duration: callDuration,
          endReason: 'cancelled',
        });
      }
      setOutgoingCall(null);
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
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-background">
      {/* Sidebar - Astrologer List */}
      <div className={`${
        selectedAstrologer ? 'hidden lg:flex' : 'flex'
      } w-full lg:w-96 flex-col bg-white dark:bg-card border-r border-gray-200 dark:border-border`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Communication</h2>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-primary-400 hover:bg-indigo-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <SearchBar
              placeholder="Search astrologers..."
              value={searchQuery}
              onSearch={(query) => setSearchQuery(query)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 dark:bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
              }`}
            >
              All ({astrologers.length})
            </button>
            <button
              onClick={() => setFilterStatus('online')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'online'
                  ? 'bg-green-600 dark:bg-green-700 text-white'
                  : 'bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
              }`}
            >
              Online ({astrologers.filter(a => a.isOnline).length})
            </button>
            <button
              onClick={() => setFilterStatus('offline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'offline'
                  ? 'bg-gray-600 dark:bg-gray-700 text-white'
                  : 'bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
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
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-muted-foreground">
              <p className="text-sm">No astrologers found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-border">
              {filteredAstrologers.map((astrologer) => (
                <button
                  key={astrologer._id}
                  onClick={() => handleSelectAstrologer(astrologer)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-muted transition-colors ${
                    selectedAstrologer?._id === astrologer._id ? 'bg-indigo-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <RoundAvatar
                    src={astrologer.profilePicture}
                    name={astrologer.name}
                    size="md"
                    isOnline={astrologer.isOnline}
                  />
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-foreground truncate">{astrologer.name}</h3>
                      {astrologer.isOnline && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">● Online</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground truncate mb-1">
                      {getLastMessagePreview(astrologer._id)}
                    </p>
                    <div className="flex items-center gap-2">
                      <PillBadge
                        variant={astrologer.isActive ? 'active' : 'inactive'}
                      />
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <MessageCircle className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
                    {(unreadCounts[astrologer._id] ?? 0) > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-indigo-600 dark:bg-primary-600 rounded-full">
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
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-background">
            <div className="text-center text-gray-500 dark:text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-muted-foreground/50" />
              <p className="text-lg font-medium dark:text-foreground">Select an astrologer to start chatting</p>
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

      {/* Outgoing Call Modal (WhatsApp-like ringing screen) */}
      {outgoingCall && selectedAstrologer && (
        <OutgoingCallModal
          calleeName={selectedAstrologer.name}
          calleeAvatar={selectedAstrologer.profilePicture}
          callType={outgoingCall.callType}
          onCancel={() => handleEndCall(0)}
        />
      )}
    </div>
  );
};

