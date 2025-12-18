import { useEffect, useState } from 'react';
import { Phone, Video, X } from 'lucide-react';
import { RoundAvatar } from '@/components/common/RoundAvatar';

interface IncomingCallModalProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal = ({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onReject,
}: IncomingCallModalProps) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // Auto-reject after 60 seconds
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center animate-[fadeIn_0.3s_ease-out]">
        {/* Caller Avatar with Pulse Animation */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse opacity-30"></div>
          <RoundAvatar
            src={callerAvatar}
            name={callerName}
            size="lg"
            className="w-24 h-24 border-4 border-white shadow-lg relative z-10"
          />
        </div>

        {/* Call Type Badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {callType === 'video' ? (
            <Video className="w-5 h-5 text-indigo-600" />
          ) : (
            <Phone className="w-5 h-5 text-green-600" />
          )}
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
        </div>

        {/* Caller Name */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{callerName}</h2>
        <p className="text-gray-600 mb-6">is calling you...</p>

        {/* Timer */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-2">
            <span className="text-2xl font-bold text-gray-700">{timeLeft}</span>
          </div>
          <p className="text-xs text-gray-500">seconds remaining</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Reject Button */}
          <button
            onClick={onReject}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
            title="Reject"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 animate-pulse"
            title="Accept"
          >
            {callType === 'video' ? (
              <Video className="w-10 h-10" />
            ) : (
              <Phone className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-400 mt-6">
          Call will be automatically rejected after timeout
        </p>
      </div>
    </div>
  );
};

