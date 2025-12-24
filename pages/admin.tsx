// Admin dashboard page
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { authOptions } from './api/auth/[...nextauth]';
import { Client } from '@/lib/types';
import ClientSelector from '@/components/Admin/ClientSelector';
import GeneratePageButton from '@/components/Admin/GeneratePageButton';
import { motion } from 'framer-motion';

interface AdminPageProps {
  initialClients: Client[];
}

export default function AdminPage({ initialClients }: AdminPageProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleGenerate = (url: string) => {
    // Update the client in the local state
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === selectedClientId
          ? { ...client, generatedPageUrl: url }
          : client
      )
    );
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-dark-surface shadow-lg rounded-lg p-6 border border-dark-border"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-dark-bg border border-dark-border rounded-md hover:bg-opacity-80 transition-colors"
            >
              Logout
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded mb-4">
              <p className="font-medium">No clients found</p>
              <p className="text-sm mt-1">
                Unable to load clients from Airtable. Please check your configuration.
              </p>
            </div>
          ) : (
            <ClientSelector
              clients={clients}
              selectedClientId={selectedClientId}
              onSelect={setSelectedClientId}
            />
          )}

          {selectedClient && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-6 bg-dark-bg rounded-lg border border-dark-border"
            >
              <div className="mb-4 pb-4 border-b border-dark-border">
                <h2 className="text-xl font-semibold text-white mb-1">
                  {selectedClient.name}
                </h2>
                {selectedClient.company && (
                  <p className="text-sm text-gray-400">{selectedClient.company}</p>
                )}
              </div>

              {selectedClient.generatedPageUrl ? (
                <div>
                  <p className="text-sm text-gray-300 mb-3 font-medium uppercase tracking-wider">
                    Generated Page URL
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <a
                      href={selectedClient.generatedPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:text-opacity-80 underline break-all flex-1 font-mono text-sm"
                    >
                      {selectedClient.generatedPageUrl}
                    </a>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClient.generatedPageUrl || '');
                      }}
                      className="px-4 py-2 text-sm bg-dark-surface hover:bg-opacity-80 border border-dark-border rounded-md text-white transition-colors flex items-center gap-2"
                      title="Copy URL"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (confirm('Generate a new URL? This will update the existing one.')) {
                        const response = await fetch(`/api/clients/${selectedClient.id}/generate`, {
                          method: 'POST',
                        });
                        if (response.ok) {
                          const data = await response.json();
                          handleGenerate(data.url);
                        }
                      }
                    }}
                    className="w-full px-4 py-2 text-sm bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-500/50 text-yellow-400 rounded-md transition-colors"
                  >
                    Regenerate URL
                  </motion.button>
                </div>
              ) : (
                <GeneratePageButton
                  clientId={selectedClient.id}
                  onGenerated={handleGenerate}
                />
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  // Redirect to login if not authenticated
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Fetch clients for authenticated users
  try {
    const { getAllClients } = await import('@/lib/airtable-client');
    const clients = await getAllClients();

    return {
      props: {
        initialClients: clients,
      },
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Return empty array on error - UI will show empty state
    return {
      props: {
        initialClients: [],
      },
    };
  }
};
