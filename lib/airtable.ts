// Airtable client configuration
import Airtable from 'airtable';

// Lazy initialization - only create base when actually used (server-side)
let baseInstance: Airtable.Base | null = null;

function getBase(): Airtable.Base {
  // Only initialize on server-side
  if (typeof window !== 'undefined') {
    throw new Error('Airtable client can only be used server-side');
  }

  if (baseInstance) {
    return baseInstance;
  }

  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY environment variable is required');
  }

  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID environment variable is required');
  }

  // Initialize Airtable client
  baseInstance = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_BASE_ID);

  return baseInstance;
}

// Export a getter function that will be called when needed (server-side only)
export default getBase;

