import { cn, getInitials, getImageUrl } from '@/utils/helpers';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({ src, alt, name, size = 'md', className }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const imageUrl = getImageUrl(src);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt || name || 'Avatar'}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
        onError={(e) => {
          // Hide broken image and show initials fallback
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold',
        sizeClasses[size],
        className
      )}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
};

