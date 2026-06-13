/**
 * API Logger utility
 * Used by API routes to send logs to the centralized log endpoint
 */

type LogType = 'info' | 'success' | 'error';

interface LogMetadata {
  [key: string]: any;
}

export async function logToAPI(
  type: LogType,
  message: string,
  metadata?: LogMetadata
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    await fetch(`${apiUrl}/api/terminal/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        message,
        timestamp: new Date().toISOString(),
        metadata: metadata || {},
      }),
    });
  } catch (error) {
    // Silent fail - don't disrupt the API call if logging fails
    console.error('Failed to send log to API:', error);
  }
}

export async function logError(message: string, metadata?: LogMetadata) {
  return logToAPI('error', message, metadata);
}

export async function logInfo(message: string, metadata?: LogMetadata) {
  return logToAPI('info', message, metadata);
}

export async function logSuccess(message: string, metadata?: LogMetadata) {
  return logToAPI('success', message, metadata);
}

