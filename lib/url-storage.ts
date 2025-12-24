// File-based storage for client URLs (fallback when Airtable field doesn't exist)
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'client-urls.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load URLs from file
export function loadClientUrls(): Record<string, string> {
  try {
    ensureDataDirectory();
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading client URLs from file:', error);
  }
  return {};
}

// Save URLs to file
export function saveClientUrl(clientId: string, url: string): void {
  try {
    ensureDataDirectory();
    const urls = loadClientUrls();
    urls[clientId] = url;
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(urls, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving client URL to file:', error);
    throw new Error('Failed to save client URL');
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

