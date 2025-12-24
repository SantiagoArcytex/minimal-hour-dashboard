// Modal component to display full hour entry details
import { HourEntry } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface HourEntryModalProps {
  entry: HourEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HourEntryModal({ entry, isOpen, onClose }: HourEntryModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!entry) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-surface rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto table-scrollbar border border-dark-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-border">
                <h2 className="text-2xl font-bold text-white">Entry Details</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-dark-bg rounded-lg"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Date & Time */}
                <div>
                  <h3 className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">
                    Date & Time
                  </h3>
                  <div className="space-y-1">
                    <p className="text-white text-lg">{formatDate(entry.date)}</p>
                    <p className="text-gray-400 text-sm">{formatTime(entry.date)}</p>
                  </div>
                </div>

                {/* Consultant */}
                <div>
                  <h3 className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">
                    Consultant
                  </h3>
                  <p className="text-white text-lg">{entry.consultant || 'N/A'}</p>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                    {entry.description || 'No description provided'}
                  </p>
                </div>

                {/* Status & Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">
                      Status
                    </h3>
                    <span
                      className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        entry.status === 'Billable'
                          ? 'bg-brand text-black'
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">
                      Hours
                    </h3>
                    <p className="text-white text-2xl font-bold">{entry.hours}</p>
                  </div>
                </div>

                {/* Entry ID (for debugging/reference) */}
                <div className="pt-4 border-t border-dark-border">
                  <p className="text-xs text-gray-500">Entry ID: {entry.id}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-dark-border">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-brand text-black font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

