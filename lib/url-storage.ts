// File-based storage for client URLs (fallback when Airtable field doesn't exist)
// Note: On Vercel, the filesystem is read-only except for /tmp, so file writes won't persist.
// This is primarily a fallback for local development. In production, Airtable should be used.
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'client-urls.json');

// Check if we're in a Vercel-like environment (read-only filesystem)
function isReadOnlyFilesystem(): boolean {
  // Vercel sets VERCEL environment variable
  return process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
}

// Ensure data directory exists
function ensureDataDirectory() {
  // Skip on Vercel - filesystem is read-only
  if (isReadOnlyFilesystem()) {
    return;
  }
  
  try {
    const dataDir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    // Silently fail on Vercel
    if (!isReadOnlyFilesystem()) {
      console.warn('Could not create data directory:', error);
    }
  }
}

// Load URLs from file
export function loadClientUrls(): Record<string, string> {
  // On Vercel, return empty object since file storage won't work
  if (isReadOnlyFilesystem()) {
    return {};
  }
  
  try {
    ensureDataDirectory();
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    // Only log errors in non-Vercel environments
    if (!isReadOnlyFilesystem()) {
      console.error('Error loading client URLs from file:', error);
    }
  }
  return {};
}

// Save URLs to file
export function saveClientUrl(clientId: string, url: string): void {
  // On Vercel, this is a no-op since file writes won't persist
  if (isReadOnlyFilesystem()) {
    console.warn('File storage not available on Vercel. URLs should be stored in Airtable.');
    return;
  }
  
  try {
    ensureDataDirectory();
    const urls = loadClientUrls();
    urls[clientId] = url;
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(urls, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving client URL to file:', error);
    // Don't throw error - let Airtable be the source of truth
    console.warn('Falling back to Airtable storage');
  }
}

// Get URL for a client
export function getClientUrl(clientId: string): string | null {
  const urls = loadClientUrls();
  return urls[clientId] || null;
}

// Get all client URLs
export function getAllClientUrls(): Record<string, string> {
  return loadClientUrls();
}

