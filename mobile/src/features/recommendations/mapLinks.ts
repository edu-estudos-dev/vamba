type BuildExternalMapUrlInput = {
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  latitude: number;
  longitude: number;
  label: string;
};

export const buildExternalMapUrl = (input: BuildExternalMapUrlInput): string => {
  if (input.platform === 'ios') {
    const query = encodeURIComponent(input.label);
    return `http://maps.apple.com/?daddr=${input.latitude},${input.longitude}&q=${query}`;
  }

  const destination = encodeURIComponent(`${input.latitude},${input.longitude}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};
