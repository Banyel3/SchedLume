'use client';

import { ResolvedClass } from '@/types';
import { ClassCard } from './ClassCard';
import { EmptyState } from './EmptyState';

interface ClassListProps {
  classes: ResolvedClass[];
  timeFormat?: '12h' | '24h';
  onClassClick?: (classData: ResolvedClass) => void;
  loading?: boolean;
}

export function ClassList({ classes, timeFormat = '12h', onClassClick, loading }: ClassListProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-surface-200 rounded-2xl h-24" />
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return <EmptyState />;
  }

  // Filter out canceled classes for display grouping but keep them
  const visibleClasses = classes.filter((c) => !c.isCanceled);
  const canceledClasses = classes.filter((c) => c.isCanceled);

  return (
    <div className="p-4 space-y-3">
      {/* Active classes */}
      {visibleClasses.map((classData) => (
        <ClassCard
          key={classData.instanceKey}
          classData={classData}
          timeFormat={timeFormat}
          onClick={() => onClassClick?.(classData)}
        />
      ))}

      {/* Canceled classes (shown at the bottom) */}
      {canceledClasses.length > 0 && (
        <>
          {visibleClasses.length > 0 && (
            <div className="flex items-center gap-2 pt-4 pb-2">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-xs text-gray-400 uppercase">Canceled</span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>
          )}
          {canceledClasses.map((classData) => (
            <ClassCard
              key={classData.instanceKey}
              classData={classData}
              timeFormat={timeFormat}
              onClick={() => onClassClick?.(classData)}
            />
          ))}
        </>
      )}
    </div>
  );
}
