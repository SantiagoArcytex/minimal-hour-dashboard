// API route to fetch all clients
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllClients } from '@/lib/airtable-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clients = await getAllClients();
    return res.status(200).json(clients);
  } catch (error) {
    console.error('Error in /api/clients:', error);
    return res.status(500).json({ error: 'Failed to fetch clients' });
  }
}

