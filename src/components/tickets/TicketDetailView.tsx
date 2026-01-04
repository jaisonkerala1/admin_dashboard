import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { socketService } from '@/services/socketService';
import {
  fetchTicketDetailRequest,
  updateTicketStatusRequest,
  updateTicketPriorityRequest,
  addMessageRequest,
  addInternalNoteRequest,
  clearCurrentTicket,
} from '@/store/slices/ticketSlice';
import { Card, Loader, Avatar } from '@/components/common';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { TicketCategoryBadge } from './TicketCategoryBadge';
import {
  ArrowLeft,
  Send,
  User,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Star,
  StickyNote,
} from 'lucide-react';
import type { TicketStatus, TicketPriority, MessageSenderType } from '@/types/ticket';

export const TicketDetailView: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentTicket, isLoadingTicketDetail, isSendingMessage, error } = useAppSelector(
    (state) => state.ticket
  );

  const [messageText, setMessageText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchTicketDetailRequest({ ticketId }));
      
      // Join Socket.IO ticket room
      socketService.joinTicket(ticketId);

      // Listen for real-time updates
      const unsubscribeMessage = socketService.onTicketMessage((message: any) => {
        if (message.ticketId === ticketId) {
          // Refresh ticket detail to show new message
          dispatch(fetchTicketDetailRequest({ ticketId }));
        }
      });

      const unsubscribeStatus = socketService.onTicketStatusChange((data: any) => {
        if (data.ticketId === ticketId) {
          // Refresh ticket detail
          dispatch(fetchTicketDetailRequest({ ticketId }));
        }
      });

      const unsubscribeAssign = socketService.onTicketAssign((data: any) => {
        if (data.ticketId === ticketId) {
          // Refresh ticket detail
          dispatch(fetchTicketDetailRequest({ ticketId }));
        }
      });

      const unsubscribePriority = socketService.onTicketPriorityChange((data: any) => {
        if (data.ticketId === ticketId) {
          // Refresh ticket detail
          dispatch(fetchTicketDetailRequest({ ticketId }));
        }
      });

      return () => {
        socketService.leaveTicket(ticketId);
        unsubscribeMessage();
        unsubscribeStatus();
        unsubscribeAssign();
        unsubscribePriority();
        dispatch(clearCurrentTicket());
      };
    }
    return () => {
      dispatch(clearCurrentTicket());
    };
  }, [dispatch, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentTicket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !ticketId) return;

    dispatch(
      addMessageRequest({
        ticketId,
        data: {
          message: messageText,
          isInternal,
        },
      })
    );
    setMessageText('');
    setIsInternal(false);
  };

  const handleAddInternalNote = () => {
    if (!internalNoteText.trim() || !ticketId) return;

    dispatch(
      addInternalNoteRequest({
        ticketId,
        note: internalNoteText,
      })
    );
    setInternalNoteText('');
    setShowInternalNotes(false);
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!ticketId) return;
    dispatch(updateTicketStatusRequest({ ticketId, data: { status } }));
    setShowStatusDropdown(false);
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    if (!ticketId) return;
    dispatch(updateTicketPriorityRequest({ ticketId, data: { priority } }));
    setShowPriorityDropdown(false);
  };

  const getMessageBgColor = (senderType: MessageSenderType, isInternal: boolean) => {
    if (isInternal) return 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600';
    if (senderType === 'admin') return 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800';
    if (senderType === 'system') return 'bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border';
    return 'bg-white dark:bg-card border border-gray-100 dark:border-border';
  };

  if (isLoadingTicketDetail) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500 dark:text-muted-foreground">
          {error || 'Ticket not found'}
        </p>
        <button
          onClick={() => navigate('/support')}
          className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          Back to tickets
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/support')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-gray-500 dark:text-muted-foreground">
              {currentTicket.ticketNumber}
            </span>
            <TicketCategoryBadge category={currentTicket.category} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
            {currentTicket.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ticket Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground">{currentTicket.description}</p>
              </div>
            </div>

            {currentTicket.userHistory && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border">
                <h4 className="text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  User Ticket History
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-muted-foreground">Total Tickets:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-foreground">
                      {currentTicket.userHistory.totalTickets}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-muted-foreground">Closed:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-foreground">
                      {currentTicket.userHistory.closedTickets}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-muted-foreground">Avg Rating:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-foreground flex items-center gap-1">
                      {typeof (currentTicket.userHistory as any)?.avgRating === 'number'
                        ? (currentTicket.userHistory as any).avgRating.toFixed(1)
                        : '—'}
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Messages */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
              Conversation ({currentTicket.messages.length})
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-border">
              {currentTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-2xl ${getMessageBgColor(
                    message.senderType,
                    message.isInternal
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={message.senderName}
                      size="sm"
                      className="flex-shrink-0 border border-gray-100 dark:border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-foreground">
                          {message.senderName}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase tracking-wider">
                          {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                        </span>
                        {message.isInternal && (
                          <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-tighter">
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-foreground whitespace-pre-wrap leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="mt-6 pt-6 border-t border-gray-100 dark:border-border">
              <div className="flex items-center gap-2 mb-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-muted-foreground cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-border rounded focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="group-hover:text-gray-900 dark:group-hover:text-foreground transition-colors">Send as internal note (not visible to user)</span>
                </label>
              </div>
              <div className="relative group">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full pl-4 pr-16 py-3 border border-gray-200 dark:border-border rounded-2xl bg-gray-50/50 dark:bg-muted/50 text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  disabled={isSendingMessage}
                />
                <div className="absolute right-2 bottom-2">
                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSendingMessage}
                    className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-30 disabled:hover:bg-primary-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    title="Send Message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </Card>

          {/* Internal Notes Section */}
          {currentTicket.internalNotes && (
            <Card className="p-6 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Admin Notes (Internal)
                </h3>
                <button
                  onClick={() => setShowInternalNotes(!showInternalNotes)}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-3 py-1 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  {showInternalNotes ? 'Hide' : 'Add Note'}
                </button>
              </div>
              <div className="text-sm text-gray-700 dark:text-foreground whitespace-pre-wrap leading-relaxed">
                {currentTicket.internalNotes}
              </div>
              {showInternalNotes && (
                <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                  <textarea
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    placeholder="Add internal note..."
                    rows={2}
                    className="w-full px-4 py-2 border border-amber-200 dark:border-amber-800 rounded-xl bg-white dark:bg-card text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInternalNote}
                      disabled={!internalNoteText.trim()}
                      className="px-5 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm"
                    >
                      Add Note
                    </button>
                    <button
                      onClick={() => {
                        setShowInternalNotes(false);
                        setInternalNoteText('');
                      }}
                      className="px-5 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-muted text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Priority */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
              Ticket Details
            </h3>
            <div className="space-y-5">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                  Status
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full text-left p-0.5 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                  >
                    <TicketStatusBadge status={currentTicket.status} />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {(['open', 'in_progress', 'waiting_for_user', 'closed'] as TicketStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                        >
                          <TicketStatusBadge status={status} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                  Priority
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="w-full text-left p-0.5 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                  >
                    <TicketPriorityBadge priority={currentTicket.priority} />
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {(['Urgent', 'High', 'Medium', 'Low'] as TicketPriority[]).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(priority)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                        >
                          <TicketPriorityBadge priority={priority} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                  Assigned To
                </label>
                <div className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-400 dark:text-muted-foreground" />
                  </div>
                  {currentTicket.assignedToName || 'Unassigned'}
                </div>
              </div>

              {/* Response Time */}
              {currentTicket.responseTime && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Response Time
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                    <Clock className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                    {currentTicket.responseTime} minutes
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* User Info */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
              User Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                    {currentTicket.userName}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-muted-foreground font-mono truncate">ID: {currentTicket.userId}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-muted flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-muted-foreground group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                </div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground truncate">
                  {currentTicket.userEmail}
                </div>
              </div>
              {currentTicket.userPhone && (
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-muted flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-muted-foreground group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-muted-foreground">
                    {currentTicket.userPhone}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Timestamps */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
              Timeline
            </h3>
            <div className="space-y-4 text-sm">
              <div className="relative pl-6 pb-4 border-l border-gray-100 dark:border-border last:pb-0">
                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-card shadow-sm" />
                <div className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider mb-0.5">Created</div>
                <div className="text-gray-900 dark:text-foreground font-medium">
                  {format(new Date(currentTicket.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              {currentTicket.updatedAt && (
                <div className="relative pl-6 pb-4 border-l border-gray-100 dark:border-border last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-card shadow-sm" />
                  <div className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider mb-0.5">Last Updated</div>
                  <div className="text-gray-900 dark:text-foreground font-medium">
                    {format(new Date(currentTicket.updatedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              )}
              {currentTicket.resolvedAt && (
                <div className="relative pl-6 last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-card shadow-sm" />
                  <div className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider mb-0.5">Resolved</div>
                  <div className="text-gray-900 dark:text-foreground font-medium">
                    {format(new Date(currentTicket.resolvedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


