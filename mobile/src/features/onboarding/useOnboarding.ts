import { useCallback, useEffect, useState } from 'react';

import { loadJson, saveJson } from '../../lib/storage';

const ONBOARDING_KEY = 'vamba_onboarding_done';

export const useOnboarding = () => {
  const [isDone, setIsDone] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    loadJson<boolean>(ONBOARDING_KEY, false).then((stored) => {
      if (!active) return;
      setIsDone(stored);
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const complete = useCallback(() => {
    setIsDone(true);
    void saveJson(ONBOARDING_KEY, true);
  }, []);

  return { isDone, isLoaded, complete };
};
