// Consultant filter dropdown component
import { HourEntry } from '@/lib/types';

interface ConsultantFilterProps {
  hours: HourEntry[];
  selectedConsultant: string | null;
  onSelect: (consultant: string | null) => void;
}

export default function ConsultantFilter({
  hours,
  selectedConsultant,
  onSelect,
}: ConsultantFilterProps) {
  // Extract unique consultants from hours data
  // Only include consultants that appear in the hours for THIS client
  // Filter out empty values and ensure uniqueness
  const consultantSet = new Set<string>();
  
  hours.forEach((entry) => {
    // Only add non-empty consultant values
    if (entry.consultant && entry.consultant.trim() !== '') {
      // If consultant contains a comma (multiple employees), split and add each
      const consultants = entry.consultant.split(',').map(c => c.trim()).filter(Boolean);
      consultants.forEach(consultant => consultantSet.add(consultant));
    }
  });
  
  // Convert to sorted array - these are already filtered to only this client's hours
  const consultants = Array.from(consultantSet).sort();

  return (
    <div className="mb-4">
      <label
        htmlFor="consultant-filter"
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        Filter by Consultant
      </label>
      <select
        id="consultant-filter"
        value={selectedConsultant || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-md shadow-sm text-white focus:ring-2 focus:ring-brand focus:border-brand"
      >
        <option value="" className="bg-dark-surface">All Consultants</option>
        {consultants.map((consultant) => (
          <option key={consultant} value={consultant} className="bg-dark-surface">
            {consultant}
          </option>
        ))}
      </select>
    </div>
  );
}

