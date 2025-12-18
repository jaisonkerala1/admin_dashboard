import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Video, Send, Loader2, ArrowLeft } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { socketService } from '@/services/socketService';
import type { DirectMessage } from '@/types/communication';
import type { Astrologer } from '@/types';
import { RoundAvatar } from '@/components/common/RoundAvatar';
import { PillBadge } from '@/components/common/PillBadge';

interface ChatWindowProps {
  astrologer: Astrologer;
  onBack: () => void;
  onCall: (type: 'voice' | 'video') => void;
}

export const ChatWindow = ({ astrologer, onBack, onCall }: ChatWindowProps) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversationId = `admin_${astrologer._id}`;

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        await socketService.connectAndWait();

        // Join conversation
        socketService.joinConversation(conversationId);

        // Load message history
        socketService.getMessageHistory(conversationId, 1, 50, (loadedMessages) => {
          if (!isMounted) return;
          setMessages(loadedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ));
          setIsLoading(false);
        });

        // Listen for new messages
        const unsubscribe = socketService.onMessage((message) => {
          if (message.conversationId === conversationId) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some(m => m._id === message._id)) {
                return prev;
              }
              return [...prev, message];
            });
          }
        });

        // Listen for typing indicator
        const unsubscribeTyping = socketService.onTyping((data) => {
          if (data.conversationId === conversationId && data.userId !== 'admin') {
            setIsTyping(data.isTyping);
          }
        });

        return () => {
          isMounted = false;
          socketService.leaveConversation(conversationId);
          unsubscribe();
          unsubscribeTyping();
        };
      } catch (err) {
        console.error('Failed to initialize chat window:', err);
        setIsLoading(false);
      }
    };

    const cleanupPromise = init();

    return () => {
      isMounted = false;
      // Ensure cleanup even if init throws
      cleanupPromise?.then((cleanup) => cleanup?.());
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    socketService.sendMessage({
      conversationId,
      recipientId: astrologer._id,
      recipientType: 'astrologer',
      content: newMessage.trim(),
      messageType: 'text',
    });

    setNewMessage('');
    socketService.stopTyping(conversationId);
    setIsSending(false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing
    socketService.startTyping(conversationId);

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(conversationId);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <Link 
            to={`/astrologers/${astrologer._id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <RoundAvatar
              src={astrologer.profilePicture}
              name={astrologer.name}
              size="md"
              isOnline={astrologer.isOnline}
            />
            
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {astrologer.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {astrologer.isOnline ? (
                  <span className="text-xs text-green-600 font-medium">Online</span>
                ) : (
                  <span className="text-xs text-gray-500">Offline</span>
                )}
                <PillBadge variant={astrologer.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCall('voice')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voice Call"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onCall('video')}
            className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Video Call"
          >
            <Video className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                isOwn={message.senderType === 'admin'}
              />
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

