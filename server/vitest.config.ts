import { defineConfig } from 'vitest/config';

/**
 * A suite compartilha o `.env` do desenvolvimento. Com `PLACES_PROVIDER=google`
 * ligado para testar o app, um `npm test` distraido dispara chamadas pagas de
 * verdade — foi o que aconteceu mais de uma vez durante a Milestone 2.
 * Estes valores vencem o `.env` (`dotenv` nao sobrescreve variavel ja definida),
 * entao o teste roda sempre com provider fake, offline e sem custo.
 */
export default defineConfig({
  test: {
    env: {
      PLACES_PROVIDER: 'fake',
      AI_PROVIDER: 'fake',
      TRANSLATION_PROVIDER: 'fake',
    },
  },
});
