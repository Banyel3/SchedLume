import { WEEKDAYS, WEEKDAYS_SHORT } from "../constants";

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * Format a date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the day of week (0-6) for a date string
 */
export function getWeekday(dateString: string): number {
  return parseDate(dateString).getDay();
}

/**
 * Get the weekday name (e.g., "Monday")
 */
export function getWeekdayName(dateString: string): string {
  return WEEKDAYS[getWeekday(dateString)];
}

/**
 * Get the short weekday name (e.g., "Mon")
 */
export function getWeekdayShort(dateString: string): string {
  return WEEKDAYS_SHORT[getWeekday(dateString)];
}

/**
 * Add days to a date string
 */
export function addDays(dateString: string, days: number): string {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Get an array of dates for a week containing the given date
 */
export function getWeekDates(
  dateString: string,
  weekStart: "monday" | "sunday" = "monday"
): string[] {
  const date = parseDate(dateString);
  const currentDay = date.getDay();

  // Calculate offset to week start
  const startOffset =
    weekStart === "monday"
      ? currentDay === 0
        ? -6
        : 1 - currentDay
      : -currentDay;

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(addDays(dateString, startOffset + i));
  }

  return weekDates;
}

/**
 * Get an array of dates around a given date (for date strip)
 */
export function getSurroundingDates(
  dateString: string,
  range: number = 3
): string[] {
  const dates: string[] = [];
  for (let i = -range; i <= range; i++) {
    dates.push(addDays(dateString, i));
  }
  return dates;
}

/**
 * Format a date for display (e.g., "Monday, January 11")
 */
export function formatDateDisplay(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date for short display (e.g., "Jan 11")
 */
export function formatDateShort(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if two date strings are the same
 */
export function isSameDate(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getToday();
}

/**
 * Check if a date string is in the past
 */
export function isPast(dateString: string): boolean {
  return dateString < getToday();
}

/**
 * Check if a date string is in the future
 */
export function isFuture(dateString: string): boolean {
  return dateString > getToday();
}

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(year: number, month: number): string {
  return formatDate(new Date(year, month, 1));
}

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(year: number, month: number): string {
  return formatDate(new Date(year, month + 1, 0));
}

/**
 * Get all dates in a month
 */
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day++) {
    dates.push(formatDate(new Date(year, month, day)));
  }

  return dates;
}

/**
 * Get the year and month from a date string
 */
export function getYearMonth(dateString: string): {
  year: number;
  month: number;
} {
  const date = parseDate(dateString);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

/**
 * Format month and year for display (e.g., "January 2026")
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
