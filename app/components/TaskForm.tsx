import { useState, useRef, useEffect } from 'react';

interface TaskFormProps {
  onSubmit: (title: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦到输入框
  useEffect(() => {
    if (inputRef.current && !isSubmitting) {
      inputRef.current.focus();
    }
  }, [isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证输入
    if (!title.trim()) {
      setError('请输入任务标题');
      return;
    }

    if (title.trim().length > 200) {
      setError('任务标题长度不能超过200个字符');
      return;
    }

    try {
      await onSubmit(title.trim());
      // 清空表单
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建任务失败，请重试');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    // 清除错误信息
    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={handleInputChange}
            placeholder="输入新任务..."
            disabled={isSubmitting}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500'}`}
            maxLength={200}
          />
          {/* 字符计数指示器 */}
          {title.length > 0 && (
            <span className={`absolute right-3 bottom-2 text-xs ${title.length > 180 ? 'text-amber-500' : 'text-gray-400'}`}>
              {title.length}/200
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs sm:text-sm text-red-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className={`w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${!title.trim() ? 'opacity-70' : ''}`}
        >
          {isSubmitting ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isSubmitting ? '添加中...' : '添加任务'}
        </button>
      </form>
    </div>
  );
}