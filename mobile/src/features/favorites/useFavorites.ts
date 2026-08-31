import { useCallback, useEffect, useState } from 'react';
import type { Favorite } from './types';
import type { RecommendationItem } from '../recommendations/types';

const FAVORITES_KEY = 'vamba_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch {
      setFavorites([]);
    }
    setIsLoaded(true);
  }, []);

  const save = useCallback(
    (item: RecommendationItem) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === item.place.id);
        if (exists) return prev;

        const favorite: Favorite = {
          ...item.place,
          savedAt: new Date().toISOString(),
        };

        const updated = [...prev, favorite];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const remove = useCallback((placeId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== placeId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorited = useCallback((placeId: string) => {
    return favorites.some((f) => f.id === placeId);
  }, [favorites]);

  return {
    favorites,
    isLoaded,
    save,
    remove,
    isFavorited,
  };
};
