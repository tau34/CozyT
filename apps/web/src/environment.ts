export type WebEnvironment = 'development' | 'test' | 'production';

const mode = import.meta.env.MODE;
const environment: WebEnvironment = mode === 'production' || mode === 'test' ? mode : 'development';

export const webEnvironment = {
  name: environment,
  isDevelopment: environment === 'development',
  isTest: environment === 'test',
  isProduction: environment === 'production'
} as const;
