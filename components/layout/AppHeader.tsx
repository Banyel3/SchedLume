"use client";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  showBackButton,
  onBack,
  rightAction,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-surface-200/80 z-30">
      <div className="flex items-center justify-between px-6 sm:px-8 h-14 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBackButton && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-surface-100 transition-colors shrink-0"
              aria-label="Go back"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && <div className="shrink-0 ml-3">{rightAction}</div>}
      </div>
    </header>
  );
}
