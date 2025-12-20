import { format } from 'date-fns';
import { Check, CheckCheck, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff } from 'lucide-react';
import type { DirectMessage } from '@/types/communication';

interface ChatMessageProps {
  message: DirectMessage;
  isOwn: boolean;
}

export const ChatMessage = ({ message, isOwn }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render call log message (WhatsApp style)
  if (message.messageType === 'call_log') {
    const isVideo = message.callType === 'video';
    const isCompleted = message.callStatus === 'completed';
    const isMissed = message.callStatus === 'missed';
    const isDeclined = message.callStatus === 'declined';
    const isCancelled = message.callStatus === 'cancelled';
    
    // Determine icon and color
    let CallIcon = Phone;
    let iconColor = 'text-gray-500';
    let statusText = '';
    
    if (isVideo) {
      CallIcon = Video;
    }
    
    if (isMissed) {
      CallIcon = PhoneMissed;
      iconColor = 'text-red-500';
      statusText = isOwn ? 'No answer' : 'Missed';
    } else if (isDeclined) {
      CallIcon = PhoneOff;
      iconColor = 'text-red-500';
      statusText = isOwn ? 'Declined' : 'Declined';
    } else if (isCancelled) {
      CallIcon = PhoneOff;
      iconColor = 'text-gray-500';
      statusText = 'Cancelled';
    } else if (isCompleted) {
      CallIcon = isOwn ? PhoneOutgoing : PhoneIncoming;
      iconColor = 'text-green-600';
      statusText = isOwn ? 'Outgoing' : 'Incoming';
    }
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg max-w-[70%]">
          <CallIcon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {isVideo ? 'Video Call' : 'Voice Call'}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
              <span>{statusText}</span>
              {isCompleted && message.callDuration !== undefined && (
                <>
                  <span>•</span>
                  <span>{formatDuration(message.callDuration)}</span>
                </>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Regular text/media messages
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


