import { track as vercelTrack } from "@vercel/analytics/react";

/**
 * Tracks custom user events in Vercel Analytics with safe error handling.
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean | null>) {
  try {
    vercelTrack(name, properties);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[Vercel Analytics] Failed to track "${name}":`, err);
    }
  }
}

export { vercelTrack as track };
