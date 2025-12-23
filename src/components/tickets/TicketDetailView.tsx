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
    if (isInternal) return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400';
    if (senderType === 'admin') return 'bg-blue-50 dark:bg-blue-900/20';
    if (senderType === 'system') return 'bg-gray-50 dark:bg-gray-800';
    return 'bg-white dark:bg-gray-700';
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
        <p className="text-gray-500 dark:text-gray-400">
          {error || 'Ticket not found'}
        </p>
        <button
          onClick={() => navigate('/support')}
          className="mt-4 text-primary-600 hover:text-primary-700"
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
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              {currentTicket.ticketNumber}
            </span>
            <TicketCategoryBadge category={currentTicket.category} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{currentTicket.description}</p>
              </div>
            </div>

            {currentTicket.userHistory && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Ticket History
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total Tickets:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {currentTicket.userHistory.totalTickets}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Closed:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {currentTicket.userHistory.closedTickets}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Avg Rating:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white flex items-center gap-1">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversation ({currentTicket.messages.length})
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
              {currentTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${getMessageBgColor(
                    message.senderType,
                    message.isInternal
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={message.senderName}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {message.senderName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        {message.isInternal && (
                          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                            Internal Note
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  Send as internal note (not visible to user)
                </label>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                  disabled={isSendingMessage}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSendingMessage}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </form>
          </Card>

          {/* Internal Notes Section */}
          {currentTicket.internalNotes && (
            <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-yellow-600" />
                  Admin Notes (Internal)
                </h3>
                <button
                  onClick={() => setShowInternalNotes(!showInternalNotes)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {showInternalNotes ? 'Hide' : 'Add Note'}
                </button>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {currentTicket.internalNotes}
              </div>
              {showInternalNotes && (
                <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                  <textarea
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    placeholder="Add internal note..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInternalNote}
                      disabled={!internalNoteText.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Add Note
                    </button>
                    <button
                      onClick={() => {
                        setShowInternalNotes(false);
                        setInternalNoteText('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Ticket Details
            </h3>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Status
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full text-left"
                  >
                    <TicketStatusBadge status={currentTicket.status} />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1">
                      {(['open', 'in_progress', 'waiting_for_user', 'closed'] as TicketStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600"
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
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Priority
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="w-full text-left"
                  >
                    <TicketPriorityBadge priority={currentTicket.priority} />
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1">
                      {(['Urgent', 'High', 'Medium', 'Low'] as TicketPriority[]).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(priority)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600"
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
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Assigned To
                </label>
                <div className="text-sm text-gray-900 dark:text-white">
                  {currentTicket.assignedToName || 'Unassigned'}
                </div>
              </div>

              {/* Response Time */}
              {currentTicket.responseTime && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Response Time
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <Clock className="w-4 h-4" />
                    {currentTicket.responseTime} minutes
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* User Info */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              User Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentTicket.userName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">User ID: {currentTicket.userId}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {currentTicket.userEmail}
                </div>
              </div>
              {currentTicket.userPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {currentTicket.userPhone}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Timestamps */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Timeline
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                <div className="text-gray-900 dark:text-white">
                  {format(new Date(currentTicket.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              {currentTicket.updatedAt && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Last Updated</div>
                  <div className="text-gray-900 dark:text-white">
                    {format(new Date(currentTicket.updatedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              )}
              {currentTicket.resolvedAt && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Resolved</div>
                  <div className="text-gray-900 dark:text-white">
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

