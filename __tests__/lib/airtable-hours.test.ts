// Unit tests for airtable-hours functions
import { getHoursByClientId, calculateHoursSummary } from '@/lib/airtable-hours';
import base from '@/lib/airtable';
import { HourEntry } from '@/lib/types';

// Mock Airtable base
jest.mock('@/lib/airtable', () => ({
  __esModule: true,
  default: {
    select: jest.fn(),
  },
}));

describe('airtable-hours', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHoursByClientId', () => {
    it('should fetch and transform hours for a client', async () => {
      const mockRecords = [
        {
          id: 'hour1',
          fields: {
            ClientID: ['rec1'],
            Date: '2025-01-15',
            Consultant: 'John Doe',
            Description: 'Test work',
            Status: 'Billable',
            Hours: 2.5,
            Internal: false,
          },
        },
        {
          id: 'hour2',
          fields: {
            ClientID: ['rec1'],
            Date: [2025, 1, 20], // Airtable date array format
            Consultant: 'Jane Smith',
            Description: 'More work',
            Status: 'Non-billable',
            Hours: 1.0,
            Internal: false,
          },
        },
      ];

      (base as any).select.mockReturnValue({
        all: jest.fn().resolves(mockRecords),
      });

      const hours = await getHoursByClientId('rec1');

      expect(hours).toHaveLength(2);
      expect(hours[0].consultant).toBe('John Doe');
      expect(hours[0].status).toBe('Billable');
      expect(hours[0].hours).toBe(2.5);
      expect(hours[1].consultant).toBe('Jane Smith');
      expect(hours[1].status).toBe('Non-billable');
    });

    it('should handle errors gracefully', async () => {
      (base as any).select.mockReturnValue({
        all: jest.fn().rejects(new Error('Airtable error')),
      });

      await expect(getHoursByClientId('rec1')).rejects.toThrow('Failed to fetch hours');
    });
  });

  describe('calculateHoursSummary', () => {
    it('should calculate billable and non-billable totals correctly', () => {
      const hours: HourEntry[] = [
        {
          id: '1',
          clientId: 'rec1',
          date: new Date('2025-01-15'),
          consultant: 'John',
          description: 'Work 1',
          status: 'Billable',
          hours: 2.5,
          internal: false,
        },
        {
          id: '2',
          clientId: 'rec1',
          date: new Date('2025-01-16'),
          consultant: 'Jane',
          description: 'Work 2',
          status: 'Billable',
          hours: 3.25,
          internal: false,
        },
        {
          id: '3',
          clientId: 'rec1',
          date: new Date('2025-01-17'),
          consultant: 'John',
          description: 'Work 3',
          status: 'Non-billable',
          hours: 1.5,
          internal: false,
        },
      ];

      const summary = calculateHoursSummary(hours);

      expect(summary.billable).toBe(5.75);
      expect(summary.nonBillable).toBe(1.5);
      expect(summary.total).toBe(7.25);
    });

    it('should round to 2 decimal places', () => {
      const hours: HourEntry[] = [
        {
          id: '1',
          clientId: 'rec1',
          date: new Date('2025-01-15'),
          consultant: 'John',
          description: 'Work',
          status: 'Billable',
          hours: 1.333333,
          internal: false,
        },
      ];

      const summary = calculateHoursSummary(hours);

      expect(summary.billable).toBe(1.33);
    });

    it('should return zeros for empty array', () => {
      const summary = calculateHoursSummary([]);

      expect(summary.billable).toBe(0);
      expect(summary.nonBillable).toBe(0);
      expect(summary.total).toBe(0);
    });
  });
});

