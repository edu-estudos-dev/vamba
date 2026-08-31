import { describe, expect, it } from 'vitest';

import { buildExternalMapUrl } from './mapLinks';

describe('buildExternalMapUrl', () => {
  it('builds an Apple Maps URL for iOS', () => {
    expect(
      buildExternalMapUrl({
        platform: 'ios',
        latitude: 38.7139,
        longitude: -9.1394,
        label: 'Praça do Comércio',
      }),
    ).toBe('http://maps.apple.com/?daddr=38.7139,-9.1394&q=Pra%C3%A7a%20do%20Com%C3%A9rcio');
  });

  it('builds a Google Maps URL for Android and other platforms', () => {
    expect(
      buildExternalMapUrl({
        platform: 'android',
        latitude: 38.7139,
        longitude: -9.1394,
        label: 'Praça do Comércio',
      }),
    ).toBe('https://www.google.com/maps/dir/?api=1&destination=38.7139%2C-9.1394');
  });
});
