// Totals section component displaying billable, non-billable, and total hours
import { HoursSummary } from '@/lib/types';
import { motion } from 'framer-motion';

interface TotalsSectionProps {
  summary: HoursSummary;
}

export default function TotalsSection({ summary }: TotalsSectionProps) {
  const cards = [
    { label: 'Billable Hours', value: summary.billable, color: 'text-brand' },
    { label: 'Non-Billable Hours', value: summary.nonBillable, color: 'text-orange-500' },
    { label: 'Hours Used', value: summary.total, color: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-dark-surface p-6 rounded-lg shadow border border-dark-border"
        >
          <h3 className="text-sm font-medium text-gray-400 mb-2">{card.label}</h3>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            className={`text-3xl font-bold ${card.color}`}
          >
            {card.value}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}

