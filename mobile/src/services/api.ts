import { appConfig } from '../config/app';

export const api = {
  healthUrl: () => `${appConfig.apiBaseUrl}/health`,
};
