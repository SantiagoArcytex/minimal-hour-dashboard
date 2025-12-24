// API route to fetch hours for a client
import type { NextApiRequest, NextApiResponse } from 'next';
import { getHoursByClientId } from '@/lib/airtable-hours';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId } = req.query;

  if (!clientId || typeof clientId !== 'string') {
    return res.status(400).json({ error: 'Client ID is required' });
  }

  try {
    const hours = await getHoursByClientId(clientId);
    return res.status(200).json(hours);
  } catch (error) {
    console.error('Error in /api/hours/[clientId]:', error);
    return res.status(500).json({ error: 'Failed to fetch hours' });
  }
}

