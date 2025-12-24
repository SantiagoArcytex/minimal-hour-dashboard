// Client data fetching functions from Airtable
import base from './airtable';
import { Client } from './types';
import { loadClientUrls, saveClientUrl, getClientUrl } from './url-storage';

// Cache for the field name to avoid repeated lookups
let cachedUrlFieldName: string | null = null;

/**
 * Helper function to find the correct field name for GeneratedPageURL
 * Tries common variations of the field name and caches the result
 */
async function findGeneratedPageUrlFieldName(): Promise<string> {
  // Return cached value if available
  if (cachedUrlFieldName) {
    return cachedUrlFieldName;
  }

  try {
    // Get a sample record to see available fields
    // Don't specify a view - Airtable will use the default view
    const records = await base()('Clients').select({
      maxRecords: 1,
    }).firstPage();

    if (records.length > 0) {
      const fields = Object.keys(records[0].fields);
      
      // Try to find a field that matches common patterns
      const possibleNames = [
        'GeneratedPageURL',
        'Generated Page URL',
        'GeneratedPageUrl',
        'generatedPageURL',
        'Generated URL',
        'Page URL',
        'Client URL',
        'Dashboard URL',
      ];

      for (const possibleName of possibleNames) {
        if (fields.includes(possibleName)) {
          cachedUrlFieldName = possibleName;
          console.log(`Found URL field name: ${possibleName}`);
          return possibleName;
        }
      }

      // If no match found, log available fields for debugging
      console.warn('Available fields in Clients table:', fields);
      console.warn('Could not find GeneratedPageURL field. Please create a field in Airtable with one of these names:', possibleNames);
    }
  } catch (error) {
    console.error('Error finding field name:', error);
  }

  // Default fallback
  cachedUrlFieldName = 'GeneratedPageURL';
  return 'GeneratedPageURL';
}

/**
 * Fetch all clients from the "Clients" table
 */
export async function getAllClients(): Promise<Client[]> {
  try {
    // Don't specify a view - Airtable will use the default view
    const records = await base()('Clients').select().all();

    // Try to find the correct field name dynamically
    const urlFieldName = await findGeneratedPageUrlFieldName();
    
    // Load URLs from file storage as fallback
    const fileUrls = loadClientUrls();

    return records.map((record) => {
      // Try Airtable field first, then fall back to file storage
      const airtableUrl = record.fields[urlFieldName] as string;
      const fileUrl = fileUrls[record.id];
      const generatedPageUrl = airtableUrl || fileUrl || null;

      return {
        id: record.id,
        name: (record.fields.Name as string) || '',
        company: (record.fields.Company as string) || null,
        generatedPageUrl,
      };
    });
  } catch (error) {
    console.error('Error fetching clients from Airtable:', error);
    throw new Error('Failed to fetch clients');
  }
}

/**
 * Fetch a single client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  try {
    const record = await base()('Clients').find(id);
    
    // Try to find the correct field name dynamically
    const urlFieldName = await findGeneratedPageUrlFieldName();
    
    // Load URL from file storage as fallback
    const fileUrl = getClientUrl(id);
    const airtableUrl = record.fields[urlFieldName] as string;
    const generatedPageUrl = airtableUrl || fileUrl || null;

    return {
      id: record.id,
      name: (record.fields.Name as string) || '',
      company: (record.fields.Company as string) || null,
      generatedPageUrl,
    };
  } catch (error: any) {
    // Check if it's a "not found" error
    if (error?.statusCode === 404 || error?.error?.type === 'NOT_FOUND') {
      console.error(`Client ${id} not found in Airtable`);
      return null;
    }
    console.error(`Error fetching client ${id} from Airtable:`, error);
    // Re-throw to let caller handle it
    throw error;
  }
}

/**
 * Update the GeneratedPageURL field for a client
 */
export async function updateClientGeneratedUrl(
  id: string,
  url: string
): Promise<void> {
  try {
    // Try Airtable first
    const urlFieldName = await findGeneratedPageUrlFieldName();
    
    try {
      await base()('Clients').update(id, {
        [urlFieldName]: url,
      });
      console.log(`Successfully saved URL to Airtable for client ${id}`);
      return; // Success, exit early
    } catch (airtableError: any) {
      // If Airtable fails (field doesn't exist), fall back to file storage
      if (airtableError?.error?.error === 'UNKNOWN_FIELD_NAME' || 
          airtableError?.error?.message?.includes('Unknown field')) {
        console.log(`Airtable field not available, using file storage for client ${id}`);
        saveClientUrl(id, url);
        return;
      }
      // Re-throw if it's a different error
      throw airtableError;
    }
  } catch (error: any) {
    console.error(`Error updating client ${id} URL:`, error);
    
    // Last resort: try file storage
    try {
      saveClientUrl(id, url);
      console.log(`Saved URL to file storage as fallback for client ${id}`);
    } catch (fileError) {
      // Provide more specific error information
      if (error?.error?.message) {
        throw new Error(`Airtable error: ${error.error.message}`);
      }
      throw new Error('Failed to update client URL in both Airtable and file storage');
    }
  }
}

