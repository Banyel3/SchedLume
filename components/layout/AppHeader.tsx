'use client';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function AppHeader({ title, subtitle, showBackButton, onBack, rightAction }: AppHeaderProps) {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-surface-200 z-30">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-surface-100"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
