// Modern searchable client selector component
import { Client } from '@/lib/types';
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelect: (clientId: string) => void;
}

export default function ClientSelector({
  clients,
  selectedClientId,
  onSelect,
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Sort clients alphabetically by name
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [clients]);

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return sortedClients;
    
    const query = searchQuery.toLowerCase();
    return sortedClients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        (client.company && client.company.toLowerCase().includes(query))
    );
  }, [sortedClients, searchQuery]);

  // Reset highlighted index when filtered clients change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredClients.length, searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredClients.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredClients[highlightedIndex]) {
          handleSelect(filteredClients[highlightedIndex].id);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredClients, highlightedIndex]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (clientId: string) => {
    onSelect(clientId);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(0);
  };

  return (
    <div className="mb-6 relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Client
      </label>
      
      {/* Selected Client Display / Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-md shadow-sm text-left text-white focus:ring-2 focus:ring-brand focus:border-brand transition-colors flex items-center justify-between hover:border-brand/50"
      >
        <span className={selectedClient ? 'text-white' : 'text-gray-500'}>
          {selectedClient
            ? `${selectedClient.name}${selectedClient.company ? ` • ${selectedClient.company}` : ''}`
            : '-- Select a client --'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 w-full mt-2 bg-dark-surface border border-dark-border rounded-md shadow-lg max-h-80 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-dark-border">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Client List */}
              <div ref={dropdownRef} className="max-h-64 overflow-y-auto table-scrollbar">
                {filteredClients.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No clients found
                  </div>
                ) : (
                  filteredClients.map((client, index) => (
                    <motion.button
                      key={client.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleSelect(client.id)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        index === highlightedIndex
                          ? 'bg-brand/20 border-l-2 border-brand'
                          : selectedClientId === client.id
                          ? 'bg-dark-bg/50'
                          : 'hover:bg-dark-bg'
                      } ${
                        index !== filteredClients.length - 1
                          ? 'border-b border-dark-border'
                          : ''
                      }`}
                    >
                      <div className="text-white font-medium">{client.name}</div>
                      {client.company && (
                        <div className="text-sm text-gray-400 mt-1">
                          {client.company}
                        </div>
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
