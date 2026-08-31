import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const saveJson = async (key: string, value: unknown): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // persistencia local e best-effort; o estado em memoria continua valido
  }
};

export const removeKey = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // idem
  }
};
