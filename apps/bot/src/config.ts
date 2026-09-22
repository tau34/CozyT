import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface BotConfig {
  environment: RuntimeEnvironment;
  webhookUrl: string;
  webhookSecret: string;
  port: number;
}

function getEnvironment(): RuntimeEnvironment {
  const environment = process.env.NODE_ENV ?? 'development';
  if (environment === 'production' || environment === 'test') return environment;
  return 'development';
}

export function getBotConfig(): BotConfig {
  const environment = getEnvironment();
  const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  loadDotenv({ path: path.join(workspaceRoot, `.env.${environment}.local`) });
  loadDotenv({ path: path.join(workspaceRoot, `.env.${environment}`) });
  loadDotenv({ path: path.join(workspaceRoot, '.env') });

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const webhookSecret = process.env.COZYT_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    throw new Error(`DISCORD_WEBHOOK_URL and COZYT_WEBHOOK_SECRET are required for ${environment} environment.`);
  }


  return {
    environment,
    webhookUrl,
    webhookSecret,
    port: Number(process.env.PORT) || 10000
  };
}
