import { config as loadDotenv } from 'dotenv';
import path from 'node:path';

export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface BotConfig {
  environment: RuntimeEnvironment;
  token: string;
  clientId: string;
  guildId?: string;
  debugGuildId?: string;
  webUrl: string;
}

function getEnvironment(): RuntimeEnvironment {
  const environment = process.env.NODE_ENV ?? 'development';
  if (environment === 'production' || environment === 'test') return environment;
  return 'development';
}

export function getBotConfig(): BotConfig {
  const environment = getEnvironment();
  loadDotenv({ path: path.resolve(process.cwd(), `.env.${environment}.local`) });
  loadDotenv({ path: path.resolve(process.cwd(), `.env.${environment}`) });
  loadDotenv({ path: path.resolve(process.cwd(), '.env') });

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!token || !clientId) {
    throw new Error(`DISCORD_TOKEN and DISCORD_CLIENT_ID are required for ${environment} environment.`);
  }

  const debugGuildId = process.env.DISCORD_TEST_GUILD_ID;
  if (environment === 'test' && !debugGuildId) {
    throw new Error('DISCORD_TEST_GUILD_ID is required for the test environment.');
  }

  return {
    environment,
    token,
    clientId,
    guildId: environment === 'test' ? debugGuildId : process.env.DISCORD_GUILD_ID,
    debugGuildId,
    webUrl: process.env.COZYT_WEB_URL ?? 'http://localhost:5173'
  };
}
