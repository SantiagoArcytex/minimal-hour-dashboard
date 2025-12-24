// Hours data fetching functions from Airtable
import base from './airtable';
import { HourEntry, HoursSummary } from './types';

/**
 * Helper function to fetch employee names from their record IDs
 * Employees field links to an Employees table (or similar)
 */
async function getEmployeeNames(employeeIds: string[]): Promise<Record<string, string>> {
  const nameMap: Record<string, string> = {};
  
  if (!employeeIds || employeeIds.length === 0) {
    return nameMap;
  }

  console.log(`Attempting to fetch names for ${employeeIds.length} employee IDs`);

  try {
    // Try common table names for employees
    const possibleTableNames = ['Employees', 'Employee', 'Consultants', 'Consultant', 'People', 'People Table', 'Staff'];
    
    for (const tableName of possibleTableNames) {
      try {
        // First, try to get a sample record to see what fields exist
        const sampleRecords = await base()(tableName).select({ maxRecords: 1 }).firstPage();
        if (sampleRecords.length === 0) {
          continue; // Table is empty or doesn't exist
        }
        
        const sampleFields = Object.keys(sampleRecords[0].fields);
        console.log(`Table "${tableName}" exists. Available fields:`, sampleFields);
        
        // Find the name field
        const nameField = sampleFields.find(f => 
          f.toLowerCase().includes('name') || 
          f === 'Name' || 
          f === 'Full Name'
        ) || 'Name';
        
        // Fetch employees in batches (Airtable has limits)
        const uniqueIds = Array.from(new Set(employeeIds));
        let foundCount = 0;
        
        for (const id of uniqueIds) {
          try {
            const record = await base()(tableName).find(id);
            // Use the identified name field
            const name = (record.fields as any)[nameField] || 
                        (record.fields as any)['Name'] || 
                        (record.fields as any)['Full Name'] ||
                        id; // Fallback to ID if no name field
            nameMap[id] = name as string;
            foundCount++;
          } catch (err) {
            // Record not found in this table, continue
            continue;
          }
        }
        
        console.log(`Found ${foundCount} employee names in table "${tableName}"`);
        
        // If we found at least one, assume this is the right table
        if (foundCount > 0) {
          break;
        }
      } catch (err) {
        // Table doesn't exist, try next
        continue;
      }
    }
    
    if (Object.keys(nameMap).length === 0) {
      console.warn('Could not find any employee names. Employee IDs will be used instead.');
    }
  } catch (error) {
    console.warn('Could not fetch employee names:', error);
  }

  return nameMap;
}

/**
 * Fetch hours from "Hours Log" table filtered by clientId
 * Excludes entries where Internal checkbox is true
 */
export async function getHoursByClientId(clientId: string): Promise<HourEntry[]> {
  try {
    // First, try to get all records and filter in JavaScript for reliability
    // This is more reliable than complex Airtable formulas, especially for linked fields
    console.log(`Fetching hours for client: ${clientId}`);
    
    // Don't specify a view - Airtable will use the default view
    // This avoids errors if "Grid view" doesn't exist
    const records = await base()('Hours Log')
      .select()
      .all();

    console.log(`Total records fetched: ${records.length}`);

    // Log available fields from first record for debugging
    if (records.length > 0) {
      const firstRecordFields = Object.keys(records[0].fields);
      console.log('Available fields in Hours Log table:', firstRecordFields);
      // Try to find the clients field - it could be "Clients", "ClientID", "Client ID", etc.
      const clientsFieldValue = (records[0].fields as any)['Clients'] || 
                                records[0].fields.ClientID || 
                                (records[0].fields as any)['Client ID'] || 
                                (records[0].fields as any)['ClientId'] ||
                                (records[0].fields as any)['clientID'];
      console.log('Sample Clients field value:', clientsFieldValue);
      console.log('Sample Clients field type:', typeof clientsFieldValue, Array.isArray(clientsFieldValue) ? '(array)' : '');
      
      // Find a record that actually has a client linked to see the structure
      const recordWithClient = records.find((r) => {
        const val = (r.fields as any)['Clients'] || r.fields.ClientID;
        return val && (Array.isArray(val) ? val.length > 0 : true);
      });
      if (recordWithClient) {
        const clientVal = (recordWithClient.fields as any)['Clients'] || recordWithClient.fields.ClientID;
        console.log('Example record with client linked - Clients field:', clientVal);
      }
    }

    // Filter records where Clients link field contains the clientId
    // Airtable link fields return arrays of record IDs
    // The field is called "Clients" (plural) based on the logs
    const clientRecords = records.filter((record) => {
      // Try "Clients" first (plural), then other variations
      const clientIdValue = (record.fields as any)['Clients'] ||
                           record.fields.ClientID ||
                           (record.fields as any)['Client ID'] || 
                           (record.fields as any)['ClientId'] ||
                           (record.fields as any)['clientID'];
      
      if (!clientIdValue) {
        return false;
      }

      // Link fields are arrays of record IDs
      if (Array.isArray(clientIdValue)) {
        return clientIdValue.includes(clientId);
      }
      
      // Fallback: if it's a string, check direct match
      if (typeof clientIdValue === 'string') {
        return clientIdValue === clientId;
      }

      return false;
    });

    console.log(`Records matching client ${clientId}: ${clientRecords.length}`);

    // Filter out internal entries
    // Check for "Internal" field - can be checkbox (boolean) or single select (string: "Yes"/"No")
    const filteredRecords = clientRecords.filter((record) => {
      const internalField = (record.fields.Internal as any) || 
                           (record.fields as any)['Internal'];
      
      if (typeof internalField === 'boolean') {
        // Checkbox field: true = internal, false = not internal
        return !internalField;
      } else if (typeof internalField === 'string') {
        // Single select field: "Yes" = internal, "No" = not internal
        const internalStr = internalField.toLowerCase().trim();
        return internalStr !== 'yes' && internalStr !== 'y';
      }
      
      // Default: not internal if field doesn't exist or is falsy
      return true;
    });

    console.log(`Records after filtering internal: ${filteredRecords.length}`);

    // Collect all unique employee IDs to fetch their names
    const allEmployeeIds = new Set<string>();
    filteredRecords.forEach((record) => {
      const employeesField = (record.fields as any)['Employees'];
      if (Array.isArray(employeesField)) {
        employeesField.forEach((id: string) => allEmployeeIds.add(id));
      } else if (employeesField && typeof employeesField === 'string') {
        // Handle single employee ID as string
        allEmployeeIds.add(employeesField);
      }
    });

    console.log(`Found ${allEmployeeIds.size} unique employee IDs to fetch names for`);
    if (allEmployeeIds.size > 0) {
      console.log('Sample employee IDs:', Array.from(allEmployeeIds).slice(0, 5));
    }

    // Fetch employee names
    const employeeNames = await getEmployeeNames(Array.from(allEmployeeIds));
    console.log(`Successfully fetched ${Object.keys(employeeNames).length} employee names`);
    if (Object.keys(employeeNames).length > 0) {
      console.log('Sample employee name mappings:', Object.entries(employeeNames).slice(0, 3));
    }

    const mappedRecords = filteredRecords.map((record) => {
      const dateField = record.fields.Date;
      let date: Date;

      if (typeof dateField === 'string') {
        date = new Date(dateField);
      } else if (dateField instanceof Date) {
        date = dateField;
      } else if (Array.isArray(dateField) && dateField.length >= 3) {
        // Airtable date fields can be arrays [YYYY, MM, DD]
        // Check if all elements are numbers before using them
        const first = dateField[0];
        const second = dateField[1];
        const third = dateField[2];
        if (
          typeof first === 'number' &&
          typeof second === 'number' &&
          typeof third === 'number'
        ) {
          date = new Date(first, second - 1, third);
        } else {
          date = new Date();
        }
      } else {
        date = new Date();
      }

      // Handle field name variations based on actual Airtable field names
      // From logs: 'Employees', 'Hours Logged', 'Billable', 'Summary'
      // "Employees" is a linked field (array of record IDs), so we need to fetch names
      const employeesField = (record.fields as any)['Employees'];
      let consultant = '';
      
      if (employeesField) {
        if (Array.isArray(employeesField) && employeesField.length > 0) {
          // Map employee IDs to names, fallback to ID if name not found
          const names = employeesField
            .map((id: string) => employeeNames[id] || id)
            .filter(Boolean);
          consultant = names.join(', '); // Join multiple employees with comma
        } else if (typeof employeesField === 'string') {
          consultant = employeeNames[employeesField] || employeesField;
        }
      } else {
        // Fallback to other field names
        consultant = (record.fields.Consultant as string) || 
                     (record.fields as any)['Consultant'] || '';
      }
      const description = (record.fields as any)['Summary'] || 
                         (record.fields.Description as string) || 
                         (record.fields as any)['Description'] || '';
      
      // "Billable" field is a single select with "Yes" and "No" options
      // Also check for "Status" field as fallback
      // Handle both checkbox (boolean) and single select (string: "Yes"/"No")
      const billableField = (record.fields as any)['Billable'] || 
                           (record.fields as any)['Status'] ||
                           (record.fields.Billable as any);
      let isBillable = false;
      
      if (typeof billableField === 'boolean') {
        // Checkbox field: true = billable, false = non-billable
        isBillable = billableField === true;
      } else if (typeof billableField === 'string') {
        // Single select field: "Yes" = billable, "No" = non-billable
        const billableStr = billableField.toLowerCase().trim();
        isBillable = billableStr === 'yes' || billableStr === 'y';
        // Explicitly check for "No" to ensure it's treated as non-billable
        if (billableStr === 'no' || billableStr === 'n') {
          isBillable = false;
        }
      } else if (billableField === true || billableField === 1) {
        // Handle edge cases where it might be 1/0
        isBillable = true;
      }
      
      const status: 'Billable' | 'Non-billable' = isBillable ? 'Billable' : 'Non-billable';
      const hours = (record.fields as any)['Hours Logged'] as number || 
                   (record.fields.Hours as number) || 
                   (record.fields as any)['Hours'] || 0;

      // Handle Internal field - can be checkbox (boolean) or single select (string: "Yes"/"No")
      const internalField = (record.fields.Internal as any) || 
                           (record.fields as any)['Internal'];
      let internal = false;
      
      if (typeof internalField === 'boolean') {
        // Checkbox field: true = internal
        internal = internalField === true;
      } else if (typeof internalField === 'string') {
        // Single select field: "Yes" = internal
        const internalStr = internalField.toLowerCase().trim();
        internal = internalStr === 'yes' || internalStr === 'y';
      }

      return {
        id: record.id,
        clientId: clientId,
        date: date,
        consultant,
        description,
        status,
        hours,
        internal,
      };
    });

    console.log(`Successfully mapped ${mappedRecords.length} hour entries`);
    return mappedRecords;
  } catch (error) {
    console.error(`Error fetching hours for client ${clientId} from Airtable:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch hours');
  }
}

/**
 * Calculate billable and non-billable hours summary
 */
export function calculateHoursSummary(hours: HourEntry[]): HoursSummary {
  const billable = hours
    .filter((entry) => entry.status === 'Billable')
    .reduce((sum, entry) => sum + entry.hours, 0);

  const nonBillable = hours
    .filter((entry) => entry.status === 'Non-billable')
    .reduce((sum, entry) => sum + entry.hours, 0);

  return {
    billable: Math.round(billable * 100) / 100, // Round to 2 decimal places
    nonBillable: Math.round(nonBillable * 100) / 100,
    total: Math.round((billable + nonBillable) * 100) / 100,
  };
}

