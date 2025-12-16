import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  action?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, backButton, action, className }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {backButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

