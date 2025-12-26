import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './Card';

export interface AreaChartCardProps {
  /** Chart data array */
  data: Array<Record<string, any>>;
  /** Data key for the area (e.g., 'consultations', 'serviceRequests') */
  dataKey: string;
  /** Chart title */
  title: string;
  /** Icon component for the title */
  icon?: LucideIcon;
  /** Icon color class */
  iconColor?: string;
  /** Area color (hex or tailwind color) */
  color: string;
  /** Display name for the tooltip */
  name?: string;
  /** Footer content - React node */
  footer?: React.ReactNode;
  /** Chart height (default: 256px / h-64) */
  height?: number;
}

/**
 * Reusable Area Chart Card Component
 * Shadcn-style area chart with gradient fill
 */
export const AreaChartCard: React.FC<AreaChartCardProps> = ({
  data,
  dataKey,
  title,
  icon: Icon,
  iconColor = 'text-gray-600',
  color,
  name,
  footer,
  height = 256,
}) => {
  // Generate unique gradient ID based on dataKey
  const gradientId = `fill-${dataKey}`;
  
  // Convert color to CSS variable format if it's a hex color
  const getColorVar = (color: string) => {
    // If it's already a CSS variable or hex, return as is
    if (color.startsWith('var(') || color.startsWith('#')) {
      return color;
    }
    // Otherwise assume it's a tailwind color class and convert
    return `var(--color-${dataKey})`;
  };

  const colorValue = color.startsWith('#') ? color : getColorVar(color);

  return (
    <Card
      title={
        Icon ? (
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <span>{title}</span>
          </div>
        ) : (
          title
        )
      }
    >
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              // Keep some breathing room so the stroke/fill never feels clipped
              top: 12,
              bottom: 18,
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colorValue}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colorValue}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              height={28}
              minTickGap={12}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickFormatter={(value) => {
                // Show abbreviated labels for better readability
                if (typeof value === 'string' && value.length > 6) {
                  return value.slice(0, 3);
                }
                return value;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickMargin={8}
              allowDecimals={false}
              // Add a bit of headroom so peaks don't touch the top,
              // while keeping 0 pinned to the bottom (no "squashed" plot).
              domain={[
                0,
                (dataMax: number) => {
                  const max = Number.isFinite(dataMax) ? dataMax : 0;
                  const pad = Math.max(1, Math.ceil(max * 0.1));
                  return max + pad;
                },
              ]}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ 
                fontWeight: 600, 
                marginBottom: '4px',
                color: '#1f2937'
              }}
              formatter={(value: number) => [value, name || dataKey]}
            />
            <Area
              // 'natural' can overshoot below 0 between points; monotone avoids that.
              type="monotone"
              dataKey={dataKey}
              fill={`url(#${gradientId})`}
              fillOpacity={0.4}
              stroke={colorValue}
              strokeWidth={2}
              baseValue={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {footer && (
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </Card>
  );
};

