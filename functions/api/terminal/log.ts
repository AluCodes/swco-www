import type { Env } from '../../_lib/env.d';
import { logError, logInfo, logSuccess } from '../../_lib/logger';

type LogRequest = {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp?: string;
  metadata?: unknown;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { type, message, metadata } = await request.json() as LogRequest;

    if (!type || !message) {
      return Response.json({ error: 'Type and message are required' }, { status: 400 });
    }

    const logFn = type === 'error' ? logError : type === 'success' ? logSuccess : logInfo;
    await logFn(env, message, metadata);

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Failed to save log: ${message}` }, { status: 500 });
  }
};
