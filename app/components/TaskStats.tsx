import { Task } from '../../lib/types';
import { FC } from 'react';

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;
  
  // 根据完成率确定颜色
  const getProgressColor = () => {
    if (completionPercentage === 100) return 'bg-green-500';
    if (completionPercentage > 75) return 'bg-emerald-500';
    if (completionPercentage > 50) return 'bg-blue-500';
    if (completionPercentage > 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm mb-4 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200">
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        任务统计
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-sm transition-all duration-200 transform hover:-translate-y-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">总任务</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{totalTasks}</p>
        </div>
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-sm transition-all duration-200 transform hover:-translate-y-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">已完成</p>
          <p className="text-xl sm:text-2xl font-bold text-green-500">{completedTasks}</p>
        </div>
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-sm transition-all duration-200 transform hover:-translate-y-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">完成率</p>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: getProgressColor().replace('bg-', '') }}>
            {completionPercentage}%
          </p>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="mt-2 sm:mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">完成进度</span>
          <span className="text-xs sm:text-sm font-medium" style={{ color: getProgressColor().replace('bg-', '') }}>
            {completionPercentage}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${getProgressColor()}`} 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      
      {/* 任务状态说明 */}
      {totalTasks > 0 && (
        <div className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>{completedTasks > 0 ? `你已经完成了 ${completedTasks} 个任务，` : '开始添加并完成任务，'}继续加油！</p>
        </div>
      )}
    </div>
  );
}