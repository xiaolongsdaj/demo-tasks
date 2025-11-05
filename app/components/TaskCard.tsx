import { Task } from '../../lib/types';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onToggleStatus, onDelete }: TaskCardProps) {
  // 格式化创建日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 flex items-start space-x-3 sm:space-x-4 transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
      <button 
        onClick={() => onToggleStatus(task.id, !task.completed)}
        className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${task.completed 
          ? 'border-green-500 bg-green-500 text-white' 
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'}`}
        aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
        tabIndex={0}
        role="checkbox"
        aria-checked={task.completed}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <div className="flex-grow min-w-0">
        <h3 className={`text-sm sm:text-base font-medium ${task.completed 
          ? 'text-gray-500 dark:text-gray-400 line-through' 
          : 'text-gray-900 dark:text-gray-100'}`}>
          {task.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-1.5">
          创建于 {formatDate(task.createdAt)}
        </p>
      </div>
      
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="删除任务"
        tabIndex={0}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}