"use client";

import { create } from "zustand";
import { getToday, addDays } from "@/lib/utils/date";

interface DateState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
}

export const useSelectedDate = create<DateState>((set, get) => ({
  selectedDate: getToday(),

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  goToToday: () => {
    set({ selectedDate: getToday() });
  },

  goToPrevDay: () => {
    const current = get().selectedDate;
    set({ selectedDate: addDays(current, -1) });
  },

  goToNextDay: () => {
    const current = get().selectedDate;
    set({ selectedDate: addDays(current, 1) });
  },
}));
