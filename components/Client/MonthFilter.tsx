// Month filter dropdown component
import { HourEntry } from '@/lib/types';

interface MonthFilterProps {
  hours: HourEntry[];
  selectedMonth: string | null;
  onSelect: (month: string | null) => void;
}

export default function MonthFilter({
  hours,
  selectedMonth,
  onSelect,
}: MonthFilterProps) {
  // Extract unique months from hours data
  const months = Array.from(
    new Set(
      hours.map((entry) => {
        const date = new Date(entry.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  )
    .sort()
    .reverse(); // Most recent first

  const monthOptions = months.map((monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      key: monthKey,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  return (
    <div className="mb-4">
      <label
        htmlFor="month-filter"
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        Filter by Month
      </label>
      <select
        id="month-filter"
        value={selectedMonth || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-md shadow-sm text-white focus:ring-2 focus:ring-brand focus:border-brand"
      >
        <option value="" className="bg-dark-surface">All Months</option>
        {monthOptions.map((option) => (
          <option key={option.key} value={option.key} className="bg-dark-surface">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

