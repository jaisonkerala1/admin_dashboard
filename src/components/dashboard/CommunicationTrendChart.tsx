import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MessageSquare, Phone, Video } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveMetric } from '@/store/slices/communicationAnalyticsSlice';
import { format } from 'date-fns';
import { cn } from '@/utils/helpers';

const metrics = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    color: '#3b82f6', // blue-500
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    id: 'voice',
    label: 'Voice Calls',
    icon: Phone,
    color: '#10b981', // emerald-500
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    id: 'video',
    label: 'Video Calls',
    icon: Video,
    color: '#8b5cf6', // violet-500
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
] as const;

export const CommunicationTrendChart = () => {
  const dispatch = useAppDispatch();
  const { trends, activeMetric, isLoading } = useAppSelector((state) => state.communicationAnalytics);

  const totals = useMemo(() => {
    return {
      messages: trends.reduce((acc, curr) => acc + (curr.messages || 0), 0),
      voice: trends.reduce((acc, curr) => acc + (curr.voice || 0), 0),
      video: trends.reduce((acc, curr) => acc + (curr.video || 0), 0),
    };
  }, [trends]);

  const activeConfig = useMemo(() => {
    return metrics.find((m) => m.id === activeMetric)!;
  }, [activeMetric]);

  if (isLoading && trends.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Interactive Header */}
      <div className="flex border-b border-gray-100">
        {metrics.map((metric) => {
          const isActive = activeMetric === metric.id;
          const totalValue = totals[metric.id as keyof typeof totals];
          
          return (
            <button
              key={metric.id}
              onClick={() => dispatch(setActiveMetric(metric.id))}
              className={cn(
                "flex-1 px-6 py-4 text-left transition-all duration-200 relative group",
                isActive ? "bg-gray-50/50" : "hover:bg-gray-50/30"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isActive ? metric.textColor : "text-gray-400 group-hover:text-gray-500"
                )}>
                  {metric.label}
                </span>
                <metric.icon className={cn(
                  "w-4 h-4",
                  isActive ? metric.textColor : "text-gray-300 group-hover:text-gray-400"
                )} />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalValue.toLocaleString()}
              </div>
              
              {/* Active Indicator Line */}
              {isActive && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5" 
                  style={{ backgroundColor: metric.color }} 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-6 pt-8 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends}>
            <defs>
              <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="#f1f5f9" 
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(str) => format(new Date(str), 'MMM dd')}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 shadow-xl rounded-xl border border-gray-100 ring-1 ring-black/5">
                      <p className="text-xs font-bold text-gray-400 mb-1.5 uppercase">
                        {format(new Date(label), 'EEEE, MMM dd')}
                      </p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: activeConfig.color }} 
                        />
                        <span className="text-sm font-bold text-gray-900">
                          {payload[0].value?.toLocaleString()} {activeConfig.label}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={activeConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#fillColor)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

