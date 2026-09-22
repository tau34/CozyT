import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBotConfig } from './config.js';

const botConfig = getBotConfig();
const maxBodySize = 16_384;
const webDistDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web/dist');

interface WebhookMessage {
  content: string;
  username?: string;
}

function sendJson(response: ServerResponse, statusCode: number, body: Record<string, unknown>) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBodySize) throw new Error('Request body is too large.');
    chunks.push(buffer);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function isWebhookMessage(value: unknown): value is WebhookMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<WebhookMessage>;
  return typeof message.content === 'string' && message.content.trim().length > 0 && message.content.length <= 2_000;
}

async function handleWebhook(request: IncomingMessage, response: ServerResponse) {
  const authorization = request.headers.authorization;
  if (authorization !== `Bearer ${botConfig.webhookSecret}`) {
    sendJson(response, 401, { error: 'Unauthorized' });
    return;
  }

  let payload: unknown;
  try {
    payload = await readJson(request);
  } catch {
    sendJson(response, 400, { error: 'Request body must be valid JSON and smaller than 16KB.' });
    return;
  }

  if (!isWebhookMessage(payload)) {
    sendJson(response, 400, { error: 'content is required and must be 2,000 characters or fewer.' });
    return;
  }

  const discordResponse = await fetch(botConfig.webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      content: payload.content.trim(),
      ...(payload.username ? { username: payload.username.slice(0, 80) } : {})
    })
  });

  if (!discordResponse.ok) {
    console.error(`Discord webhook returned HTTP ${discordResponse.status}.`);
    sendJson(response, 502, { error: 'Discord webhook delivery failed.' });
    return;
  }

  sendJson(response, 202, { delivered: true });
}

async function handleTestMessage(request: IncomingMessage, response: ServerResponse) {
  if (botConfig.environment !== 'test') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  let payload: unknown;
  try {
    payload = await readJson(request);
  } catch {
    sendJson(response, 400, { error: 'Request body must be valid JSON and smaller than 16KB.' });
    return;
  }

  if (!isWebhookMessage(payload)) {
    sendJson(response, 400, { error: 'content is required and must be 2,000 characters or fewer.' });
    return;
  }

  await sendDiscordMessage({
    content: `🧪 **CozyT test message**\n${payload.content.trim()}`,
    ...(payload.username ? { username: payload.username.slice(0, 80) } : {})
  });
  sendJson(response, 202, { delivered: true, test: true });
}

async function sendDiscordMessage(message: WebhookMessage) {
  const discordResponse = await fetch(botConfig.webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      content: message.content.trim(),
      ...(message.username ? { username: message.username.slice(0, 80) } : {})
    })
  });

  if (!discordResponse.ok) {
    throw new Error(`Discord webhook returned HTTP ${discordResponse.status}.`);
  }
}

async function serveWebPage(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') return false;
  const requestedPath = request.url === '/' ? '/index.html' : request.url?.startsWith('/') ? request.url : '/index.html';
  const filePath = path.resolve(webDistDirectory, `.${requestedPath}`);
  if (!filePath.startsWith(webDistDirectory)) {
    sendJson(response, 400, { error: 'Invalid path' });
    return true;
  }

  try {
    const content = await readFile(filePath);
    const contentType = filePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
    response.writeHead(200, { 'content-type': contentType });
    response.end(content);
  } catch {
    const index = await readFile(path.join(webDistDirectory, 'index.html'));
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(index);
  }
  return true;
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, { status: 'ok', environment: botConfig.environment });
      return;
    }

    if (request.method === 'POST' && request.url === '/api/discord/webhook') {
      await handleWebhook(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/discord/test-message') {
      const authorization = request.headers.authorization;
      if (authorization !== `Bearer ${botConfig.webhookSecret}`) {
        sendJson(response, 401, { error: 'Unauthorized' });
        return;
      }
      await handleTestMessage(request, response);
      return;
    }

    if (await serveWebPage(request, response)) return;

    sendJson(response, 404, { error: 'Not found' });
  } catch (error: unknown) {
    console.error('Webhook service request failed', error);
    sendJson(response, 500, { error: 'Internal server error.' });
  }
});

server.listen(botConfig.port, '0.0.0.0', () => {
  console.log(`CozyT Discord webhook service is listening on port ${botConfig.port} (${botConfig.environment}).`);
});
