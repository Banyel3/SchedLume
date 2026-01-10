'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui';
import { parseCSVFile, getCSVHeaders } from '@/lib/csv/parser';
import { validateCSV } from '@/lib/csv/validator';
import { replaceAllBaseSchedules } from '@/lib/db/scheduleStore';
import { updateLastImport } from '@/lib/db/settingsStore';
import { CSVValidationError } from '@/types';

interface CSVImporterProps {
  onSuccess?: () => void;
  onError?: (errors: CSVValidationError[]) => void;
}

type ImportState = 'idle' | 'parsing' | 'validating' | 'importing' | 'success' | 'error';

export function CSVImporter({ onSuccess, onError }: CSVImporterProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [errors, setErrors] = useState<CSVValidationError[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setErrors([]);

      try {
        // Parse CSV
        setState('parsing');
        const rows = await parseCSVFile(file);
        const headers = await getCSVHeaders(file);

        // Validate
        setState('validating');
        const result = validateCSV(rows, headers);

        if (!result.isValid) {
          setState('error');
          setErrors(result.errors);
          onError?.(result.errors);
          return;
        }

        // Import
        setState('importing');
        await replaceAllBaseSchedules(result.schedules);
        await updateLastImport(file.name);

        setRowCount(result.schedules.length);
        setState('success');
        onSuccess?.();
      } catch (err) {
        setState('error');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setErrors([{ row: 0, column: 'file', message: errorMessage }]);
        onError?.([{ row: 0, column: 'file', message: errorMessage }]);
      }

      // Reset file input
      event.target.value = '';
    },
    [onSuccess, onError]
  );

  const handleReset = () => {
    setState('idle');
    setFileName('');
    setErrors([]);
    setRowCount(0);
  };

  return (
    <div className="space-y-4">
      {/* File input */}
      {state === 'idle' && (
        <div className="border-2 border-dashed border-surface-300 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Click to select a CSV file</p>
            <p className="text-xs text-gray-500 mt-1">
              Supported columns: subject, day, start_time, end_time, location, professor, color
            </p>
          </label>
        </div>
      )}

      {/* Loading states */}
      {(state === 'parsing' || state === 'validating' || state === 'importing') && (
        <div className="bg-surface-100 rounded-xl p-6 text-center">
          <div className="w-8 h-8 mx-auto mb-3 animate-spin text-primary-400">
            <svg fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            {state === 'parsing' && 'Reading file...'}
            {state === 'validating' && 'Validating data...'}
            {state === 'importing' && 'Importing schedule...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">{fileName}</p>
        </div>
      )}

      {/* Success state */}
      {state === 'success' && (
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 text-green-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-800">Import successful!</p>
          <p className="text-xs text-green-600 mt-1">
            Imported {rowCount} classes from {fileName}
          </p>
          <Button variant="secondary" size="sm" onClick={handleReset} className="mt-4">
            Import another file
          </Button>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 text-red-500 flex-shrink-0">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Import failed</p>
              <p className="text-xs text-red-600 mt-1">{fileName}</p>

              {/* Error list */}
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-xs text-red-700 bg-red-100 rounded px-2 py-1">
                    {error.row > 0 ? `Row ${error.row}: ` : ''}
                    {error.message}
                  </div>
                ))}
                {errors.length > 10 && (
                  <p className="text-xs text-red-600">... and {errors.length - 10} more errors</p>
                )}
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleReset} className="mt-4 w-full">
            Try again
          </Button>
        </div>
      )}

      {/* CSV format hint */}
      {state === 'idle' && (
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">CSV Format Example:</p>
          <code className="block bg-surface-100 rounded p-2 overflow-x-auto">
            subject,day,start_time,end_time,location,professor
            <br />
            Physics,Monday,09:00,10:30,Room 101,Dr. Smith
            <br />
            Math,Tuesday,14:00,15:30,Room 202,Prof. Johnson
          </code>
        </div>
      )}
    </div>
  );
}
