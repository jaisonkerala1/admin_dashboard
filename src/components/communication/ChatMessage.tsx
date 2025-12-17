import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import type { DirectMessage } from '@/types/communication';

interface ChatMessageProps {
  message: DirectMessage;
  isOwn: boolean;
}

export const ChatMessage = ({ message, isOwn }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {message.messageType === 'text' && (
          <p className="text-sm break-words">{message.content}</p>
        )}
        
        {message.messageType === 'image' && message.mediaUrl && (
          <div className="space-y-2">
            <img
              src={message.mediaUrl}
              alt="Shared image"
              className="rounded-lg max-w-full"
            />
            {message.content && (
              <p className="text-sm break-words">{message.content}</p>
            )}
          </div>
        )}

        <div className={`flex items-center justify-end gap-1 mt-1 ${
          isOwn ? 'text-indigo-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <>
              {message.status === 'sent' && <Check className="w-3 h-3" />}
              {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

