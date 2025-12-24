// Unit tests for airtable-client functions
import { getAllClients, getClientById, updateClientGeneratedUrl } from '@/lib/airtable-client';
import base from '@/lib/airtable';

// Mock Airtable base
jest.mock('@/lib/airtable', () => ({
  __esModule: true,
  default: {
    select: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  },
}));

describe('airtable-client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllClients', () => {
    it('should fetch and transform all clients', async () => {
      const mockRecords = [
        {
          id: 'rec1',
          fields: {
            Name: 'Client 1',
            Company: 'Company 1',
            GeneratedPageURL: 'https://example.com/client/rec1',
          },
        },
        {
          id: 'rec2',
          fields: {
            Name: 'Client 2',
            Company: null,
            GeneratedPageURL: null,
          },
        },
      ];

      (base as any).select.mockReturnValue({
        all: jest.fn().resolves(mockRecords),
      });

      const clients = await getAllClients();

      expect(clients).toHaveLength(2);
      expect(clients[0]).toEqual({
        id: 'rec1',
        name: 'Client 1',
        company: 'Company 1',
        generatedPageUrl: 'https://example.com/client/rec1',
      });
      expect(clients[1]).toEqual({
        id: 'rec2',
        name: 'Client 2',
        company: undefined,
        generatedPageUrl: undefined,
      });
    });

    it('should handle errors gracefully', async () => {
      (base as any).select.mockReturnValue({
        all: jest.fn().rejects(new Error('Airtable error')),
      });

      await expect(getAllClients()).rejects.toThrow('Failed to fetch clients');
    });
  });

  describe('getClientById', () => {
    it('should fetch and transform a single client', async () => {
      const mockRecord = {
        id: 'rec1',
        fields: {
          Name: 'Client 1',
          Company: 'Company 1',
          GeneratedPageURL: 'https://example.com/client/rec1',
        },
      };

      (base as any).find.mockResolvedValue(mockRecord);

      const client = await getClientById('rec1');

      expect(client).toEqual({
        id: 'rec1',
        name: 'Client 1',
        company: 'Company 1',
        generatedPageUrl: 'https://example.com/client/rec1',
      });
    });

    it('should return null if client not found', async () => {
      (base as any).find.mockRejectedValue(new Error('Not found'));

      const client = await getClientById('invalid');

      expect(client).toBeNull();
    });
  });

  describe('updateClientGeneratedUrl', () => {
    it('should update the GeneratedPageURL field', async () => {
      (base as any).update.mockResolvedValue({});

      await updateClientGeneratedUrl('rec1', 'https://example.com/client/rec1');

      expect(base.update).toHaveBeenCalledWith('rec1', {
        GeneratedPageURL: 'https://example.com/client/rec1',
      });
    });

    it('should handle errors gracefully', async () => {
      (base as any).update.mockRejectedValue(new Error('Update failed'));

      await expect(
        updateClientGeneratedUrl('rec1', 'https://example.com/client/rec1')
      ).rejects.toThrow('Failed to update client URL');
    });
  });
});

