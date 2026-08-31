export type RouteMode = 'walking' | 'driving' | 'transit';

export type RouteEstimate = {
  distanceMeters: number;
  durationMinutes: number;
  mode: RouteMode;
  externalUrl: string;
};

export interface RoutesProvider {
  estimateRoute(input: {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    mode: RouteMode;
  }): Promise<RouteEstimate>;
}
