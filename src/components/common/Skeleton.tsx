import { cn } from '@/utils/helpers';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
}

export const SkeletonBox = ({ 
  width, 
  height, 
  radius = 6, 
  className 
}: SkeletonBoxProps) => {
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
  };

  return (
    <div style={style} className={cn('shimmer bg-gray-200', className)} />
  );
};

interface SkeletonCircleProps {
  size: number;
  className?: string;
}

export const SkeletonCircle = ({ size, className }: SkeletonCircleProps) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
      }}
      className={cn('shimmer bg-gray-200', className)}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  width?: number | string;
  height?: number;
  spacing?: number;
  className?: string;
}

export const SkeletonText = ({ 
  lines = 1, 
  width, 
  height = 16, 
  spacing = 8,
  className 
}: SkeletonTextProps) => {
  const spacingClass = spacing === 4 ? 'mb-1' : spacing === 6 ? 'mb-1.5' : spacing === 8 ? 'mb-2' : 'mb-2';
  
  return (
    <div className={cn('flex flex-col', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBox
          key={index}
          width={index === lines - 1 ? width : width || '100%'}
          height={height}
          radius={4}
          className={index < lines - 1 ? spacingClass : ''}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SkeletonCard = ({ children, className }: SkeletonCardProps) => {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
      {children}
    </div>
  );
};

