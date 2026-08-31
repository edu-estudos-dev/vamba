import { useCallback, useEffect, useState } from 'react';

import { loadJson, removeKey, saveJson } from '../../lib/storage';

export type AnalyticsEvent = {
  name: string;
  timestamp: string;
  data?: Record<string, string | number>;
};

const ANALYTICS_KEY = 'vamba_analytics';

// ponytail: log local limitado aos eventos mais recentes; trocar por envio ao backend
// quando analytics deixar de ser apenas inspecao manual na aba do app.
const MAX_EVENTS = 500;

export const useAnalytics = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    let active = true;

    loadJson<AnalyticsEvent[]>(ANALYTICS_KEY, []).then((stored) => {
      if (active) setEvents(stored);
    });

    return () => {
      active = false;
    };
  }, []);

  const track = useCallback((name: string, data?: Record<string, string | number>) => {
    setEvents((prev) => {
      const updated = [...prev, { name, timestamp: new Date().toISOString(), data }].slice(
        -MAX_EVENTS,
      );
      void saveJson(ANALYTICS_KEY, updated);
      return updated;
    });
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    void removeKey(ANALYTICS_KEY);
  }, []);

  return { events, track, clearEvents };
};
