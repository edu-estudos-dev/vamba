import { useCallback } from 'react';

export type AnalyticsEvent = {
  name: string;
  timestamp: string;
  data?: Record<string, string | number>;
};

const ANALYTICS_KEY = 'vamba_analytics';

export const useAnalytics = () => {
  const track = useCallback((name: string, data?: Record<string, string | number>) => {
    try {
      const events = getEvents();
      const event: AnalyticsEvent = {
        name,
        timestamp: new Date().toISOString(),
        data,
      };
      events.push(event);
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
    } catch {
      // silently fail
    }
  }, []);

  const getEvents = (): AnalyticsEvent[] => {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const clearEvents = useCallback(() => {
    localStorage.removeItem(ANALYTICS_KEY);
  }, []);

  return { track, getEvents, clearEvents };
};
