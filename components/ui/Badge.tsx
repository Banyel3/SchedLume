'use client';

interface BadgeProps {
  variant?: 'default' | 'note' | 'override' | 'added' | 'canceled';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-surface-200 text-gray-600',
    note: 'bg-amber-100 text-amber-700',
    override: 'bg-blue-100 text-blue-700',
    added: 'bg-green-100 text-green-700',
    canceled: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface NoteDotProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function NoteDot({ size = 'sm', className = '' }: NoteDotProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={`inline-block rounded-full bg-amber-400 ${sizeClasses[size]} ${className}`}
      aria-label="Has notes"
    />
  );
}
