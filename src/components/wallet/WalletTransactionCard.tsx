import { useState } from 'react';
import { WalletTransaction } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { formatRelativeTime } from '@/utils/formatters';
import { Avatar } from '@/components/common';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  RefreshCw,
  DollarSign,
  Wallet as WalletIcon,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WalletTransactionCardProps {
  transaction: WalletTransaction;
  onCopy?: (transactionId: string) => void;
}

const getTransactionIcon = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'deposit':
      return ArrowDownCircle;
    case 'withdrawal':
    case 'payout':
      return ArrowUpCircle;
    case 'payment':
      return CreditCard;
    case 'refund':
      return RefreshCw;
    case 'commission':
      return DollarSign;
    default:
      return WalletIcon;
  }
};

const getTransactionColor = (type: WalletTransaction['type'], status: WalletTransaction['status']) => {
  if (status === 'failed') {
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    };
  }
  
  if (status === 'pending') {
    return {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    };
  }

  switch (type) {
    case 'deposit':
    case 'refund':
      return {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-100',
      };
    case 'withdrawal':
    case 'payout':
      return {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
      };
    case 'payment':
    case 'commission':
      return {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
      };
    default:
      return {
        text: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-100',
      };
  }
};

const getStatusBadge = (status: WalletTransaction['status']) => {
  const baseClasses = 'px-2 py-0.5 rounded-lg text-xs font-semibold';
  
  switch (status) {
    case 'completed':
      return <span className={`${baseClasses} bg-green-100 text-green-700`}>Completed</span>;
    case 'pending':
      return <span className={`${baseClasses} bg-amber-100 text-amber-700`}>Pending</span>;
    case 'failed':
      return <span className={`${baseClasses} bg-red-100 text-red-700`}>Failed</span>;
    default:
      return null;
  }
};

export const WalletTransactionCard = ({ transaction, onCopy }: WalletTransactionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = getTransactionIcon(transaction.type);
  const colors = getTransactionColor(transaction.type, transaction.status);
  const isCredit = transaction.type === 'deposit' || transaction.type === 'refund';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(transaction.transactionId);
    } else {
      navigator.clipboard.writeText(transaction.transactionId);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border ${colors.border} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Avatar
                src={transaction.userAvatar}
                name={transaction.userName}
                size="sm"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{transaction.userName}</p>
                <p className="text-xs text-gray-500">{transaction.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-sm ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                {isCredit ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(transaction.status)}
              <span className="text-xs text-gray-500">
                {formatRelativeTime(transaction.timestamp)}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy Transaction ID"
            >
              <Copy className="w-3 h-3" />
              <span className="font-mono">
                {transaction.transactionId.substring(0, 8)}...
              </span>
            </button>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">Transaction ID</p>
              <p className="font-mono text-xs">{transaction.transactionId}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">User Type</p>
              <p className="text-xs capitalize">{transaction.userType}</p>
            </div>
            {transaction.metadata?.consultationId && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Consultation ID</p>
                <p className="font-mono text-xs">{transaction.metadata.consultationId}</p>
              </div>
            )}
            {transaction.metadata?.serviceId && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Service ID</p>
                <p className="font-mono text-xs">{transaction.metadata.serviceId}</p>
              </div>
            )}
            {transaction.metadata?.razorpayOrderId && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Razorpay Order ID</p>
                <p className="font-mono text-xs">{transaction.metadata.razorpayOrderId}</p>
              </div>
            )}
            {transaction.metadata?.notes && (
              <div className="col-span-2">
                <p className="text-gray-500 text-xs mb-1">Notes</p>
                <p className="text-xs">{transaction.metadata.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

