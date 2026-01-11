/**
 * Format a time string for display
 */
export function formatTime(
  time: string,
  format: "12h" | "24h" = "12h"
): string {
  const [hours, minutes] = time.split(":").map(Number);

  if (format === "24h") {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format a time range for display
 */
export function formatTimeRange(
  startTime: string,
  endTime: string,
  format: "12h" | "24h" = "12h"
): string {
  return `${formatTime(startTime, format)} - ${formatTime(endTime, format)}`;
}

/**
 * Compare two time strings
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
export function compareTime(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Check if a time is between two other times
 */
export function isTimeBetween(
  time: string,
  start: string,
  end: string
): boolean {
  return time >= start && time <= end;
}

/**
 * Get the current time in HH:mm format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Calculate duration between two times in minutes
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return endMinutes - startMinutes;
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Check if a class is currently happening
 */
export function isClassNow(startTime: string, endTime: string): boolean {
  const currentTime = getCurrentTime();
  return isTimeBetween(currentTime, startTime, endTime);
}

/**
 * Check if a class has ended
 */
export function hasClassEnded(endTime: string): boolean {
  return getCurrentTime() > endTime;
}

/**
 * Check if a class is upcoming
 */
export function isClassUpcoming(startTime: string): boolean {
  return getCurrentTime() < startTime;
}
