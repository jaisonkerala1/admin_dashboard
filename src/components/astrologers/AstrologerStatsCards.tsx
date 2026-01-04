import { CheckCircle, Package, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface AstrologerStatsCardsProps {
  totalConsultations: number;
  completedConsultations: number;
  serviceRequests: number;
  consultationsPercentage?: number;
  completedPercentage?: number;
  serviceRequestsPercentage?: number;
}

export const AstrologerStatsCards = ({
  totalConsultations,
  completedConsultations,
  serviceRequests,
  consultationsPercentage = 0,
  completedPercentage = 0,
  serviceRequestsPercentage = 0,
}: AstrologerStatsCardsProps) => {
  const getPercentageColor = (percentage: number) => {
    return percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getPercentageIcon = (percentage: number) => {
    return percentage >= 0 ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <TrendingDown className="w-3 h-3" />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* All Consultations Card */}
      <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-border hover:-translate-y-0.5 transition-all duration-200 ease-out relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-muted-foreground mb-1">All Consultations</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{formatNumber(totalConsultations)}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getPercentageColor(consultationsPercentage)}`}>
              {getPercentageIcon(consultationsPercentage)}
              <span>{Math.abs(consultationsPercentage).toFixed(2)}%</span>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" 
                style={{ width: `${Math.min(100, (totalConsultations / Math.max(1, totalConsultations + completedConsultations)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completed Consultations Card */}
      <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-border hover:-translate-y-0.5 transition-all duration-200 ease-out relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{formatNumber(completedConsultations)}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getPercentageColor(completedPercentage)}`}>
              {getPercentageIcon(completedPercentage)}
              <span>{Math.abs(completedPercentage).toFixed(2)}%</span>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 dark:bg-purple-500 rounded-full" 
                style={{ width: `${totalConsultations > 0 ? (completedConsultations / totalConsultations) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Requests Card */}
      <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-border hover:-translate-y-0.5 transition-all duration-200 ease-out relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-muted-foreground mb-1">Service Requests</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{formatNumber(serviceRequests)}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getPercentageColor(serviceRequestsPercentage)}`}>
              {getPercentageIcon(serviceRequestsPercentage)}
              <span>{Math.abs(serviceRequestsPercentage).toFixed(2)}%</span>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-600 dark:bg-orange-500 rounded-full" 
                style={{ width: `${Math.min(100, (serviceRequests / Math.max(1, totalConsultations + serviceRequests)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

