import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// React Native nao tem `localStorage`: usar a Web Storage API faz favoritos e analytics
// funcionarem no Expo Web e quebrarem em iOS/Android. Persistencia passa por src/lib/storage.ts.
const listSourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);

    if (statSync(path).isDirectory()) {
      return listSourceFiles(path);
    }

    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });

describe('persistencia local', () => {
  it('nao usa localStorage em nenhum arquivo do app', () => {
    const offenders = [join(__dirname, '..'), join(__dirname, '..', '..', 'App.tsx')]
      .flatMap((target) => (statSync(target).isDirectory() ? listSourceFiles(target) : [target]))
      .filter((file) => readFileSync(file, 'utf8').includes('localStorage'));

    expect(offenders).toEqual([]);
  });
});
