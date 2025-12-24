// Virtualized hours table component with animations
import { HourEntry } from '@/lib/types';
import { useMemo, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import HourEntryModal from './HourEntryModal';

// Dynamically import react-window to avoid SSR issues
const FixedSizeList = dynamic(
  () => import('react-window').then((mod: any) => mod.FixedSizeList),
  { 
    ssr: false,
  }
) as any;

interface HoursTableProps {
  hours: HourEntry[];
  isLoading?: boolean;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: HourEntry[];
  onRowClick: (entry: HourEntry) => void;
}

const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 48;
const MAX_TABLE_HEIGHT = 600;

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TableRow({ index, style, data, onRowClick }: RowProps) {
  const entry = data[index];
  if (!entry) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      style={style}
      onClick={() => onRowClick(entry)}
      className={`flex items-center border-b border-dark-border cursor-pointer ${
        index % 2 === 0 ? 'bg-dark-surface' : 'bg-dark-bg'
      } hover:bg-opacity-80 transition-colors hover:border-brand/50`}
    >
      <div className="flex-1 px-6 py-4 text-sm text-white min-w-[120px]">
        {formatDate(entry.date)}
      </div>
      <div className="flex-1 px-6 py-4 text-sm text-white min-w-[150px]">
        {entry.consultant}
      </div>
      <div className="flex-1 px-6 py-4 text-sm text-white min-w-[200px] max-w-[400px]">
        <div className="truncate" title={entry.description}>
          {entry.description.length > 100 
            ? `${entry.description.substring(0, 100)}...` 
            : entry.description}
        </div>
      </div>
      <div className="flex-1 px-6 py-4 text-sm text-white min-w-[120px]">
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            entry.status === 'Billable'
              ? 'bg-brand text-black'
              : 'bg-orange-500 text-white'
          }`}
        >
          {entry.status}
        </motion.span>
      </div>
      <div className="flex-1 px-6 py-4 text-sm text-white min-w-[80px]">
        {entry.hours}
      </div>
    </motion.div>
  );
}

// Skeleton loader component
function SkeletonRow({ index }: { index: number }) {
  return (
    <div
      className={`flex items-center border-b border-dark-border ${
        index % 2 === 0 ? 'bg-dark-surface' : 'bg-dark-bg'
      }`}
      style={{ height: ROW_HEIGHT }}
    >
      {[120, 150, 200, 120, 80].map((width, i) => (
        <div key={i} className="flex-1 px-6 py-4">
          <div
            className="h-4 bg-dark-border rounded animate-pulse"
            style={{
              width: `${width}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function HoursTable({ hours, isLoading = false }: HoursTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HourEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setTableWidth(width || 800);
      }
    };

    // Initial width calculation with delay to ensure DOM is ready
    setTimeout(() => {
      updateWidth();
      setUseVirtualization(true);
    }, 100);
    
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const tableHeight = useMemo(() => {
    if (hours.length === 0) return HEADER_HEIGHT + ROW_HEIGHT;
    const calculatedHeight = hours.length * ROW_HEIGHT + HEADER_HEIGHT;
    return Math.min(calculatedHeight, MAX_TABLE_HEIGHT);
  }, [hours.length]);

  const listHeight = Math.max(tableHeight - HEADER_HEIGHT, ROW_HEIGHT);

  const handleRowClick = (entry: HourEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Small delay before clearing entry to allow exit animation
    setTimeout(() => setSelectedEntry(null), 200);
  };

  // Show skeleton while loading
  if (isLoading || !isMounted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-dark-surface rounded-lg shadow overflow-hidden w-full"
      >
        <div 
          className="flex items-center bg-dark-bg border-b-2 border-brand sticky top-0 z-10" 
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[120px]">
            Date
          </div>
          <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[150px]">
            Consultant
          </div>
          <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[200px]">
            Description
          </div>
          <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[120px]">
            Status
          </div>
          <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[80px]">
            Hours
          </div>
        </div>
        <div style={{ height: listHeight }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  if (hours.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-surface p-8 rounded-lg shadow text-center text-gray-400"
      >
        No hours entries found.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={containerRef}
      className="bg-dark-surface rounded-lg shadow overflow-hidden w-full"
    >
      {/* Fixed Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center bg-dark-bg border-b-2 border-brand sticky top-0 z-10" 
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[120px]">
          Date
        </div>
        <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[150px]">
          Consultant
        </div>
        <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[200px]">
          Description
        </div>
        <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[120px]">
          Status
        </div>
        <div className="flex-1 px-6 text-left text-xs font-semibold text-brand uppercase tracking-wider min-w-[80px]">
          Hours
        </div>
      </motion.div>

      {/* Render all rows with animations - virtualization can be added later if needed */}
      <div className="table-scrollbar" style={{ height: listHeight, width: '100%', overflowY: 'auto' }}>
        <AnimatePresence>
          {hours.map((entry, index) => {
            // Create a style object for each row
            const rowStyle: React.CSSProperties = {
              height: ROW_HEIGHT,
              position: 'relative',
            };
            return (
              <TableRow
                key={entry.id}
                index={index}
                style={rowStyle}
                data={hours}
                onRowClick={handleRowClick}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <HourEntryModal
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.div>
  );
}
