interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="mb-4 text-gray-300 dark:text-gray-600">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}