"use client";

import { useState, useCallback, useEffect } from "react";
import { useSettings } from "@/hooks";
import { AppHeader } from "@/components/layout";
import { CSVImporter } from "@/components/forms";
import { Button, Toast } from "@/components/ui";
import { clearAllData } from "@/lib/db/indexedDb";
import { downloadBackup } from "@/lib/utils/export";
import {
  downloadExampleTemplate,
  downloadScheduleCSV,
} from "@/lib/csv-template";
import {
  requestNotificationPermission,
  isNotificationPermissionGranted,
  checkAndShowDueReminders,
} from "@/lib/firebase";

type ToastState = {
  message: string;
  type: "success" | "error" | "info";
} | null;

export default function SettingsPage() {
  const { settings, updateSettings, refresh } = useSettings();
  const [toast, setToast] = useState<ToastState>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  const handleImportSuccess = useCallback(() => {
    setToast({ message: "Schedule imported successfully!", type: "success" });
    refresh();
  }, [refresh]);

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      await downloadBackup();
      setToast({ message: "Backup downloaded successfully!", type: "success" });
    } catch {
      setToast({ message: "Failed to export data", type: "error" });
    } finally {
      setExporting(false);
    }
  }, []);

  const handleExportCSV = useCallback(async () => {
    try {
      setExportingCSV(true);
      await downloadScheduleCSV();
      setToast({ message: "Schedule CSV downloaded!", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to export CSV";
      setToast({ message, type: "error" });
    } finally {
      setExportingCSV(false);
    }
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    downloadExampleTemplate();
    setToast({ message: "Template downloaded!", type: "success" });
  }, []);

  const handleClearData = useCallback(async () => {
    try {
      setClearing(true);
      await clearAllData();
      setShowClearConfirm(false);
      setToast({ message: "All data cleared successfully", type: "success" });
      refresh();
    } catch {
      setToast({ message: "Failed to clear data", type: "error" });
    } finally {
      setClearing(false);
    }
  }, [refresh]);

  const handleWeekStartChange = useCallback(
    async (value: "monday" | "sunday") => {
      try {
        await updateSettings({ weekStart: value });
      } catch {
        setToast({ message: "Failed to update setting", type: "error" });
      }
    },
    [updateSettings]
  );

  const handleTimeFormatChange = useCallback(
    async (value: "12h" | "24h") => {
      try {
        await updateSettings({ timeFormat: value });
      } catch {
        setToast({ message: "Failed to update setting", type: "error" });
      }
    },
    [updateSettings]
  );

  const handleNotificationToggle = useCallback(
    async (enabled: boolean) => {
      try {
        if (enabled && !isNotificationPermissionGranted()) {
          // Need to request permission first
          setRequestingPermission(true);
          const { permission } = await requestNotificationPermission();
          setRequestingPermission(false);

          if (permission !== "granted") {
            setToast({
              message: "Notifications require permission to be enabled",
              type: "error",
            });
            return;
          }
        }

        await updateSettings({ notificationsEnabled: enabled });
        
        if (enabled) {
          // Check for any pending reminders
          const count = await checkAndShowDueReminders();
          if (count > 0) {
            setToast({
              message: `${count} reminder(s) shown`,
              type: "info",
            });
          }
        }
      } catch {
        setToast({ message: "Failed to update notification settings", type: "error" });
      }
    },
    [updateSettings]
  );

  const handleNotificationTimeChange = useCallback(
    async (value: "08:00" | "12:00" | "18:00") => {
      try {
        await updateSettings({ notificationTime: value });
      } catch {
        setToast({ message: "Failed to update setting", type: "error" });
      }
    },
    [updateSettings]
  );

  const handleRequestPermission = useCallback(async () => {
    try {
      setRequestingPermission(true);
      const { permission } = await requestNotificationPermission();
      
      if (permission === "granted") {
        setToast({ message: "Notifications enabled!", type: "success" });
        await updateSettings({ notificationsEnabled: true });
      } else if (permission === "denied") {
        setToast({
          message: "Permission denied. Enable in browser settings.",
          type: "error",
        });
      }
    } catch {
      setToast({ message: "Failed to request permission", type: "error" });
    } finally {
      setRequestingPermission(false);
    }
  }, [updateSettings]);

  return (
    <>
      <AppHeader title="Settings" />

      <main className="w-full px-4 sm:px-6 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Schedule Import Section */}
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-5 sm:px-7 border-b border-surface-200/80">
            <h2 className="font-semibold text-gray-900">Schedule</h2>
            <p className="text-sm text-gray-500 mt-1">
              Import your class schedule from a CSV file
            </p>
          </div>
          <div className="p-5 sm:p-6 space-y-5">
            <CSVImporter onSuccess={handleImportSuccess} />

            {/* Template download link */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleDownloadTemplate}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium hover:underline"
              >
                Download CSV template
              </button>
            </div>

            {settings.lastImportedFileName && (
              <div className="mt-4 p-4 bg-surface-100 rounded-xl">
                <p className="text-xs text-gray-500">Last import</p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {settings.lastImportedFileName}
                </p>
                {settings.lastImportedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(settings.lastImportedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Data Management Section */}
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-5 sm:px-7 border-b border-surface-200/80">
            <h2 className="font-semibold text-gray-900">Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Export or clear your data
            </p>
          </div>
          <div className="p-6 sm:p-7 space-y-4">
            {/* Export schedule as CSV */}
            <Button
              variant="secondary"
              className="w-full justify-between"
              onClick={handleExportCSV}
              disabled={exportingCSV}
            >
              <span>Export Schedule (CSV)</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </Button>

            {/* Export full backup */}
            <Button
              variant="secondary"
              className="w-full justify-between"
              onClick={handleExport}
              disabled={exporting}
            >
              <span>Export Full Backup (JSON)</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </Button>

            {!showClearConfirm ? (
              <Button
                variant="ghost"
                className="w-full justify-between text-red-500 hover:bg-red-50"
                onClick={() => setShowClearConfirm(true)}
              >
                <span>Clear All Data</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            ) : (
              <div className="p-5 bg-red-50 rounded-xl space-y-4">
                <p className="text-sm text-red-700">
                  This will permanently delete all your schedules, notes, and
                  settings. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={handleClearData}
                    disabled={clearing}
                  >
                    {clearing ? "Clearing..." : "Delete Everything"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-5 sm:px-7 border-b border-surface-200/80">
            <h2 className="font-semibold text-gray-900">Preferences</h2>
          </div>
          <div className="p-6 sm:p-7 space-y-6">
            {/* Week Start */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Week Starts On
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleWeekStartChange("sunday")}
                  className={`flex-1 min-h-12 py-3 px-4 text-sm font-medium rounded-xl border transition-all active:scale-[0.98] ${
                    settings.weekStart === "sunday"
                      ? "bg-primary-50 border-primary-400 text-primary-700"
                      : "border-surface-300 text-gray-600 hover:bg-surface-100"
                  }`}
                >
                  Sunday
                </button>
                <button
                  onClick={() => handleWeekStartChange("monday")}
                  className={`flex-1 min-h-12 py-3 px-4 text-sm font-medium rounded-xl border transition-all active:scale-[0.98] ${
                    settings.weekStart === "monday"
                      ? "bg-primary-50 border-primary-400 text-primary-700"
                      : "border-surface-300 text-gray-600 hover:bg-surface-100"
                  }`}
                >
                  Monday
                </button>
              </div>
            </div>

            {/* Time Format */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Time Format
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleTimeFormatChange("12h")}
                  className={`flex-1 min-h-12 py-3 px-4 text-sm font-medium rounded-xl border transition-all active:scale-[0.98] ${
                    settings.timeFormat === "12h"
                      ? "bg-primary-50 border-primary-400 text-primary-700"
                      : "border-surface-300 text-gray-600 hover:bg-surface-100"
                  }`}
                >
                  12-hour
                </button>
                <button
                  onClick={() => handleTimeFormatChange("24h")}
                  className={`flex-1 min-h-12 py-3 px-4 text-sm font-medium rounded-xl border transition-all active:scale-[0.98] ${
                    settings.timeFormat === "24h"
                      ? "bg-primary-50 border-primary-400 text-primary-700"
                      : "border-surface-300 text-gray-600 hover:bg-surface-100"
                  }`}
                >
                  24-hour
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-5 sm:px-7 border-b border-surface-200/80">
            <h2 className="font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">
              Get reminders for notes with due dates
            </p>
          </div>
          <div className="p-6 sm:p-7 space-y-6">
            {/* Enable notifications toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Due Date Reminders</p>
                <p className="text-sm text-gray-500 mt-1">
                  Receive notifications 3, 2, and 1 day before due dates
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle(!settings.notificationsEnabled)}
                disabled={requestingPermission}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings.notificationsEnabled ? "bg-primary-400" : "bg-gray-300"
                } ${requestingPermission ? "opacity-50" : ""}`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Notification time preference */}
            {settings.notificationsEnabled && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  Reminder Time
                </label>
                <div className="flex gap-2">
                  {(["08:00", "12:00", "18:00"] as const).map((time) => (
                    <button
                      key={time}
                      onClick={() => handleNotificationTimeChange(time)}
                      className={`flex-1 py-3 px-3 text-sm font-medium rounded-xl border transition-all ${
                        settings.notificationTime === time
                          ? "bg-primary-50 border-primary-400 text-primary-700"
                          : "border-surface-300 text-gray-600 hover:bg-surface-100"
                      }`}
                    >
                      {time === "08:00" ? "8 AM" : time === "12:00" ? "12 PM" : "6 PM"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Permission status */}
            {settings.notificationPermission === "denied" && (
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-700">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              </div>
            )}

            {settings.notificationPermission === "default" && !settings.notificationsEnabled && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleRequestPermission}
                disabled={requestingPermission}
              >
                {requestingPermission ? "Requesting..." : "Enable Notifications"}
              </Button>
            )}
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-5 sm:px-7 border-b border-surface-200/80">
            <h2 className="font-semibold text-gray-900">About</h2>
          </div>
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">SchedLume</h3>
                <p className="text-sm text-gray-500">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              A mobile-first, offline-capable class schedule viewer. Your data
              is stored locally on your device.
            </p>
          </div>
        </section>
      </main>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
