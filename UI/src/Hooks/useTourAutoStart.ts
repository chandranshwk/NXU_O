/**
 * @file useTourAutoStart.ts
 * @hook useTourAutoStart
 */

import { useEffect, useRef } from "react";
import { startSpotlightTour, type TourStep } from "../components/SpotlightTour";

interface UseTourAutoStartOptions {
  storageKey: string;
  steps: TourStep[];
  enabled?: boolean;
  delay?: number;
}

const SESSION_COOLDOWN_MS = 5_00;
const SESSION_COOLDOWN_KEY = "nxuo-last-tour-dismiss";

export function useTourAutoStart({
  storageKey,
  steps,
  enabled = true,
  delay = 100,
}: UseTourAutoStartOptions): void {
  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
  });

  useEffect(() => {
    if (!enabled) {
      console.log(`[tour] ${storageKey}: skipped (enabled = false)`);
      return;
    }

    try {
      if (localStorage.getItem(storageKey)) {
        console.log(`[tour] ${storageKey}: skipped (already completed)`);
        return;
      }
    } catch {
      return;
    }

    try {
      const lastDismiss = Number(
        sessionStorage.getItem(SESSION_COOLDOWN_KEY) ?? 0,
      );
      const since = Date.now() - lastDismiss;
      if (since < SESSION_COOLDOWN_MS) {
        console.log(
          `[tour] ${storageKey}: skipped (cooldown, ${Math.round(
            (SESSION_COOLDOWN_MS - since) / 1000,
          )}s left)`,
        );
        return;
      }
    } catch {
      /* proceed */
    }

    const timer = setTimeout(() => {
      console.log(`[tour] ${storageKey}: starting...`);
      startSpotlightTour(stepsRef.current, storageKey);
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, storageKey, delay]);
}
