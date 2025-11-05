import { useState, useEffect } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Notification({ 
  type, 
  message, 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // 等待动画完成后关闭
      const fadeTimer = setTimeout(onClose, 300);
      return () => clearTimeout(fadeTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
  };

  const textColors = {
    success: 'text-green-700 dark:text-green-400',
    error: 'text-red-700 dark:text-red-400',
    info: 'text-blue-700 dark:text-blue-400'
  };

  const icons = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${bgColors[type]} ${textColors[type]}`}
    >
      <div className="flex items-center">
        <div className="mr-3">
          {icons[type]}
        </div>
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          aria-label="关闭通知"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 通知管理器钩子
export function useNotification() {
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    message: string;
  }>({ show: false, type: 'info', message: '' });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
}