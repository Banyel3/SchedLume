"use client";

import { useEffect, useRef, useCallback } from "react";
import { SWIPE_THRESHOLD } from "@/lib/constants";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = SWIPE_THRESHOLD,
}: SwipeOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const deltaX = touchStartX.current - touchEndX;
      const deltaY = Math.abs(touchStartY.current - touchEndY);

      // Only trigger horizontal swipe if it's more horizontal than vertical
      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY) {
        if (deltaX > 0) {
          // Swiped left = go to next day
          onSwipeLeft?.();
        } else {
          // Swiped right = go to previous day
          onSwipeRight?.();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
}
