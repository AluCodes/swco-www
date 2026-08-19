import type { Env } from './env.d';

type LogType = 'info' | 'success' | 'error';

async function logToAPI(env: Env, type: LogType, message: string, metadata?: unknown) {
  try {
    await fetch(`${env.API_BASE_URL}/share-and-work-terminal-add-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        message,
        timestamp: new Date().toISOString(),
        metadata: metadata || {},
      }),
    });
  } catch (error) {
    // Silent fail - don't disrupt the caller if logging fails
    console.error('Failed to send log to API:', error);
  }
}

export function logInfo(env: Env, message: string, metadata?: unknown) {
  return logToAPI(env, 'info', message, metadata);
}

export function logSuccess(env: Env, message: string, metadata?: unknown) {
  return logToAPI(env, 'success', message, metadata);
}

export function logError(env: Env, message: string, metadata?: unknown) {
  return logToAPI(env, 'error', message, metadata);
}
