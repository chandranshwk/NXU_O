/**
 * @file useFirstRun.ts
 * @hook useFirstRun
 * @description Tracks whether a one-time UI event (welcome modal, feature
 * tooltip, tour step) has already been seen by this user.
 *
 * @architecture
 * - Persists to `localStorage` under the key you pass in.
 * - Bump the version suffix (`nxuo-welcome-v1` → `nxuo-welcome-v2`) to make
 *   the event fire again for every existing user after a UX change.
 * - Fails open (returns `true` = "still first run") if `localStorage` is
 *   unavailable, so onboarding always shows at least once.
 * - SSR-safe: `window`/`localStorage` are only touched inside a function or
 *   inside the `useState` initializer, both of which run client-side only.
 *
 * @usage
 * ```tsx
 * const [isFirstRun, dismiss] = useFirstRun("nxuo-welcome-v1");
 * if (isFirstRun) { ... }
 * // call `dismiss()` when the user completes or closes the step
 * ```
 */

import { useCallback, useState } from "react";

export function useFirstRun(key: string): [boolean, () => void] {
  const [isFirstRun, setIsFirstRun] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return true;
      return !window.localStorage.getItem(key);
    } catch {
      // localStorage blocked (privacy mode, embedded webview, etc.)
      return true;
    }
  });

  const dismiss = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, "1");
      }
    } catch {
      /* write failed — the flag will simply reset on the next launch */
    }
    setIsFirstRun(false);
  }, [key]);

  return [isFirstRun, dismiss];
}

/**
 * Optional companion: reset a previously-dismissed onboarding step.
 * Useful for a "Show the welcome tour again" button in Settings.
 */
export function resetFirstRun(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
