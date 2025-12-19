import { useEffect, useState } from 'react';
import { Phone, Video, X } from 'lucide-react';
import { RoundAvatar } from '@/components/common/RoundAvatar';

interface OutgoingCallModalProps {
  calleeName: string;
  calleeAvatar?: string;
  callType: 'voice' | 'video';
  onCancel: () => void;
}

export const OutgoingCallModal = ({
  calleeName,
  calleeAvatar,
  callType,
  onCancel,
}: OutgoingCallModalProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center animate-[fadeIn_0.3s_ease-out]">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>
          <RoundAvatar
            src={calleeAvatar}
            name={calleeName}
            size="lg"
            className="w-24 h-24 border-4 border-white shadow-lg relative z-10"
          />
        </div>

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

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{calleeName}</h2>
        <p className="text-gray-600 mb-6">calling…</p>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-16 rounded-xl bg-gray-100 mb-2">
            <span className="text-xl font-bold text-gray-700">
              {mm}:{ss}
            </span>
          </div>
          <p className="text-xs text-gray-500">waiting for answer</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
            title="Cancel"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};


