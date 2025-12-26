import { WalletTransaction } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';

interface WalletTransactionCardProps {
  transaction: WalletTransaction;
  onCopy?: (transactionId: string) => void;
}

const getTransactionType = (type: WalletTransaction['type']): string => {
  switch (type) {
    case 'deposit':
    case 'refund':
      return 'Receiving';
    case 'withdrawal':
    case 'payout':
      return 'Sending';
    case 'payment':
    case 'commission':
      return 'Payment';
    default:
      return 'Transaction';
  }
};

export const WalletTransactionCard = ({ transaction }: WalletTransactionCardProps) => {
  const isCredit = transaction.type === 'deposit' || transaction.type === 'refund';
  const transactionType = getTransactionType(transaction.type);
  const transactionDate = format(new Date(transaction.timestamp), 'MMM d');
  const direction = isCredit ? 'From' : 'To';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Document/Receipt Icon */}
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-gray-400" />
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          {direction} <span className="font-semibold">{transaction.userName}</span>, {transactionType},{' '}
          <span className={isCredit ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {isCredit ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
          </span>
          , <span className="text-gray-500">{transactionDate}</span>
        </p>
      </div>
    </div>
  );
};

