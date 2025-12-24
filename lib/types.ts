// TypeScript interfaces for Airtable data structures

export interface Client {
  id: string;
  name: string;
  company?: string | null;
  generatedPageUrl?: string | null;
}

export interface HourEntry {
  id: string;
  clientId: string;
  date: Date;
  consultant: string;
  description: string;
  status: 'Billable' | 'Non-billable';
  hours: number;
  internal: boolean;
}

export interface HoursSummary {
  billable: number;
  nonBillable: number;
  total: number;
}

