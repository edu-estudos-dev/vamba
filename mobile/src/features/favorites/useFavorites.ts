import { useCallback, useEffect, useState } from 'react';
import type { Favorite } from './types';
import type { RecommendationItem } from '../recommendations/types';
import { loadJson, saveJson } from '../../lib/storage';

const FAVORITES_KEY = 'vamba_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    loadJson<Favorite[]>(FAVORITES_KEY, []).then((stored) => {
      if (!active) return;
      setFavorites(stored);
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  // Persistir depois do carregamento inicial: sem isso, o estado [] do
  // primeiro render sobrescreveria o storage antes do load resolver.
  useEffect(() => {
    if (isLoaded) {
      void saveJson(FAVORITES_KEY, favorites);
    }
  }, [favorites, isLoaded]);

  const remove = useCallback((placeId: string) => {
    setFavorites((prev) => prev.filter((favorite) => favorite.id !== placeId));
  }, []);

  const save = useCallback((item: RecommendationItem) => {
    setFavorites((prev) => {
      if (prev.some((favorite) => favorite.id === item.place.id)) {
        return prev;
      }

      return [...prev, { ...item.place, savedAt: new Date().toISOString() }];
    });
  }, []);

  const isFavorited = useCallback(
    (placeId: string) => favorites.some((favorite) => favorite.id === placeId),
    [favorites],
  );

  const toggle = useCallback(
    (item: RecommendationItem) => {
      if (isFavorited(item.place.id)) {
        remove(item.place.id);
        return 'removed' as const;
      }

      save(item);
      return 'saved' as const;
    },
    [isFavorited, remove, save],
  );

  return {
    favorites,
    isLoaded,
    save,
    remove,
    isFavorited,
    toggle,
  };
};
