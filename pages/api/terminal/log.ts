import type { NextApiRequest, NextApiResponse } from 'next';

type LogRequest = {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp?: string;
  metadata?: any;
};

type LogResponse = {
  success: boolean;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, message, timestamp, metadata } = req.body as LogRequest;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type and message are required' });
    }

    // Create log entry with timestamp
    const logTimestamp = timestamp || new Date().toISOString();
    const logEntry = {
      timestamp: logTimestamp,
      type,
      message,
      metadata: metadata || '',
    };

    // Log to console (in production, send to logging service or database)
    console.log(`[${logEntry.timestamp}] [${type.toUpperCase()}] ${message}`, metadata || '');

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/share-and-work-terminal-add-log`, {
      method: 'POST',
      body: JSON.stringify(logEntry),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving log:', message);
    res.status(500).json({ error: `Failed to save log: ${message}` });
  }
}

