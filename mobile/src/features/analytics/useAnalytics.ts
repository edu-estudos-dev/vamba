import { useCallback, useEffect, useState } from 'react';

import { loadJson, saveJson } from '../../lib/storage';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    loadJson<AnalyticsEvent[]>(ANALYTICS_KEY, []).then((stored) => {
      if (!active) return;
      setEvents(stored);
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  // Persistir dentro do updater de setEvents roda o efeito colateral duas vezes
  // em StrictMode (React invoca updaters de novo para checar pureza). O valor
  // final e o mesmo, mas o AsyncStorage.setItem duplicado e desnecessario.
  const track = useCallback((name: string, data?: Record<string, string | number>) => {
    setEvents((prev) => [...prev, { name, timestamp: new Date().toISOString(), data }].slice(-MAX_EVENTS));
  }, []);

  useEffect(() => {
    // So persiste depois do carregamento inicial: sem isso, o estado []
    // do primeiro render sobrescreveria o storage antes do load resolver.
    if (isLoaded) {
      void saveJson(ANALYTICS_KEY, events);
    }
  }, [events, isLoaded]);

  // Basta zerar o estado: o useEffect acima persiste, sem correr por cima de um
  // removeKey feito em paralelo.
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, track, clearEvents };
};
