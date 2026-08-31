import * as Location from 'expo-location';

export type LocationResult =
  | {
      status: 'granted';
      latitude: number;
      longitude: number;
    }
  | {
      status: 'denied';
      message: string;
    }
  | {
      status: 'error';
      message: string;
    };

export const requestCurrentLocation = async (): Promise<LocationResult> => {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    return {
      status: 'denied',
      message: 'Permissão de localização negada. Você ainda pode testar com localização demo.',
    };
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      status: 'granted',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return {
      status: 'error',
      message: 'Não foi possível obter sua localização agora.',
    };
  }
};
