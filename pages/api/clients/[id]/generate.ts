// API route to generate client page URL
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { updateClientGeneratedUrl } from '@/lib/airtable-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Client ID is required' });
  }

  try {
    // Determine base URL with priority order:
    // 1. NEXT_PUBLIC_BASE_URL (custom domain - highest priority)
    // 2. Request host header (detects current domain dynamically)
    // 3. VERCEL_URL (fallback for default Vercel domain)
    // 4. localhost (development fallback)
    let baseUrl: string;
    
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      // Use custom domain from environment variable
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else if (req.headers.host) {
      // Detect domain from request (works for custom domains)
      // Handle x-forwarded-proto which can be a string or array
      const forwardedProto = req.headers['x-forwarded-proto'];
      const protocol = Array.isArray(forwardedProto) 
        ? forwardedProto[0] 
        : forwardedProto || (req.headers.host.includes('localhost') ? 'http' : 'https');
      baseUrl = `${protocol}://${req.headers.host}`;
    } else if (process.env.VERCEL_URL) {
      // Fallback to Vercel's default domain
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      // Development fallback
      baseUrl = 'http://localhost:3000';
    }
    
    const generatedUrl = `${baseUrl}/client/${id}`;

    await updateClientGeneratedUrl(id, generatedUrl);

    return res.status(200).json({ url: generatedUrl });
  } catch (error) {
    console.error('Error in /api/clients/[id]/generate:', error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate client URL';
    
    // Check if it's an Airtable field name issue
    if (errorMessage.includes('field') || errorMessage.includes('Field')) {
      return res.status(500).json({ 
        error: 'Airtable field error. Please ensure "GeneratedPageURL" field exists in your Clients table.' 
      });
    }
    
    return res.status(500).json({ error: errorMessage });
  }
}

