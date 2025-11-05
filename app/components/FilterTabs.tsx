import { FC } from 'react';

export type FilterOption = 'all' | 'active' | 'completed';

interface FilterTabsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const filters: { id: FilterOption; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'active', label: '进行中' },
    { id: 'completed', label: '已完成' },
  ];

  return (
    <div className="w-full mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm">
      <div className="flex flex-wrap sm:flex-nowrap divide-x divide-gray-200 dark:divide-gray-700">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 ease-in-out ${activeFilter === filter.id
              ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-sm scale-105'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-102'}`}
            aria-pressed={activeFilter === filter.id}
            role="tab"
            aria-selected={activeFilter === filter.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onFilterChange(filter.id);
              }
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};