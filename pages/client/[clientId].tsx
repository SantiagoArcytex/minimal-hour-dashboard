// Public client dashboard page
// IMPORTANT: This page is intentionally public and does NOT require authentication.
// Client pages are meant to be shareable links that clients can access without logging in.
// Do NOT add authentication checks to this page or its getServerSideProps.
import { GetServerSideProps } from 'next';
import { useState, useMemo } from 'react';
import { Client, HourEntry, HoursSummary } from '@/lib/types';
// calculateHoursSummary is a pure function, safe to import client-side
import { calculateHoursSummary } from '@/lib/airtable-hours';
// Note: Airtable data fetching functions are dynamically imported in getServerSideProps to avoid client-side bundling
import TotalsSection from '@/components/Client/TotalsSection';
import HoursTable from '@/components/Client/HoursTable';
import MonthFilter from '@/components/Client/MonthFilter';
import ConsultantFilter from '@/components/Client/ConsultantFilter';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

interface ClientDashboardProps {
  client: Client;
  hours: HourEntry[];
  summary: HoursSummary;
}

export default function ClientDashboard({
  client,
  hours: initialHours,
  summary: initialSummary,
}: ClientDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);

  // Deserialize dates from ISO strings
  const deserializedHours = useMemo(() => {
    return initialHours.map((entry) => ({
      ...entry,
      date: new Date(entry.date as any),
    }));
  }, [initialHours]);

  // Filter hours based on selected month and consultant, then sort by date (latest first)
  const filteredHours = useMemo(() => {
    let filtered = [...deserializedHours];

    // Filter by month
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      filtered = filtered.filter((entry) => {
        const date = new Date(entry.date);
        return (
          date.getFullYear() === parseInt(year) &&
          date.getMonth() + 1 === parseInt(month)
        );
      });
    }

    // Filter by consultant
    // Handle comma-separated consultant names (multiple employees per entry)
    if (selectedConsultant) {
      filtered = filtered.filter((entry) => {
        if (!entry.consultant) return false;
        // Check if the selected consultant is in the entry's consultant field
        // (handles comma-separated names)
        const consultants = entry.consultant.split(',').map(c => c.trim());
        return consultants.includes(selectedConsultant);
      });
    }

    // Sort by date: latest to oldest
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    return filtered;
  }, [deserializedHours, selectedMonth, selectedConsultant]);

  // Recalculate summary for filtered hours
  const summary = useMemo(() => {
    return calculateHoursSummary(filteredHours);
  }, [filteredHours]);

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Client Hours Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              {client.name}
              {client.company && ` • ${client.company}`}
            </p>
          </div>
          <Logo />
        </motion.div>

        <TotalsSection summary={summary} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <MonthFilter
              hours={deserializedHours}
              selectedMonth={selectedMonth}
              onSelect={setSelectedMonth}
            />
          </div>
          <div className="flex-1">
            <ConsultantFilter
              hours={deserializedHours}
              selectedConsultant={selectedConsultant}
              onSelect={setSelectedConsultant}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">All Entries</h2>
          <HoursTable hours={filteredHours} />
        </motion.div>
      </div>
    </div>
  );
}

// Public page - no authentication required
// This getServerSideProps intentionally does NOT check for authentication
// to allow clients to access their dashboard via shareable links
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { clientId } = context.params!;

  if (!clientId || typeof clientId !== 'string') {
    console.error('Invalid clientId:', clientId);
    return {
      notFound: true,
    };
  }

  try {
    // Dynamically import Airtable functions to ensure they're only loaded server-side
    const { getClientById } = await import('@/lib/airtable-client');
    const { getHoursByClientId } = await import('@/lib/airtable-hours');
    
    // Fetch client first to check if it exists
    const client = await getClientById(clientId);
    
    if (!client) {
      console.error(`Client not found: ${clientId}`);
      return {
        notFound: true,
      };
    }

    console.log(`Found client: ${client.name} (${clientId})`);

    // Fetch hours - allow empty array if no hours exist
    let hours: HourEntry[] = [];
    try {
      hours = await getHoursByClientId(clientId);
      console.log(`Found ${hours.length} hours for client ${clientId}`);
    } catch (hoursError) {
      console.error(`Error fetching hours for client ${clientId}:`, hoursError);
      // Continue with empty hours array - client page should still work
      hours = [];
    }

    const summary = calculateHoursSummary(hours);

    // Serialize dates for props
    const serializedHours = hours.map((entry) => ({
      ...entry,
      date: entry.date.toISOString(),
    }));

    return {
      props: {
        client,
        hours: serializedHours,
        summary,
      },
    };
  } catch (error) {
    console.error(`Error fetching client data for ${clientId}:`, error);
    return {
      notFound: true,
    };
  }
};

