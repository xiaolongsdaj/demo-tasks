'use client';

import { useState, useEffect } from 'react';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import FilterTabs from './components/FilterTabs';
import TaskStats from './components/TaskStats';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import Notification, { useNotification } from './components/Notification';
import { Task, ApiResponse } from '../lib/types';

type FilterOption = 'all' | 'active' | 'completed';

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { notification, showNotification, hideNotification } = useNotification();

  // 获取所有任务
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/tasks');
      const data: ApiResponse<Task[]> = await response.json();
      
      if (data.success && data.data) {
        setTasks(data.data);
      } else {
        setError(data.error || '获取任务失败');
      }
    } catch (err) {
      setError('获取任务失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新任务
  const handleAddTask = async (title: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      
      const data: ApiResponse<Task> = await response.json();
      
      if (data.success && data.data) {
        // 添加到任务列表开头
        setTasks(prevTasks => [data.data!, ...prevTasks]);
        showNotification('success', '任务添加成功！');
      } else {
        throw new Error(data.error || '创建任务失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建任务失败';
      showNotification('error', errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新任务状态
  const handleToggleStatus = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed })
      });
      
      const data: ApiResponse<Task> = await response.json();
      
      if (data.success && data.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === id ? data.data! : task)
        );
        showNotification('success', completed ? '任务已完成！' : '任务已恢复！');
      }
    } catch (err) {
      console.error('更新任务失败:', err);
      showNotification('error', '更新任务状态失败');
      // 重新获取任务列表以确保数据一致性
      fetchTasks();
    }
  };

  // 删除任务
  const handleDeleteTask = async (id: number) => {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      
      const data: ApiResponse<null> = await response.json();
      
      if (data.success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        showNotification('success', '任务已删除！');
      } else {
        setError(data.error || '删除任务失败');
        showNotification('error', data.error || '删除任务失败');
      }
    } catch (err) {
      setError('删除任务失败，请重试');
      showNotification('error', '删除任务失败');
    }
  };

  // 应用过滤器
  useEffect(() => {
    switch (activeFilter) {
      case 'active':
        setFilteredTasks(tasks.filter(task => !task.completed));
        break;
      case 'completed':
        setFilteredTasks(tasks.filter(task => task.completed));
        break;
      default:
        setFilteredTasks(tasks);
    }
  }, [tasks, activeFilter]);

  // 初始加载任务
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-4 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">任务管理器</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">简单高效地管理你的日常任务</p>
        </header>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6">
            <strong className="font-bold">错误！</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <main className="space-y-6">
          {/* 任务统计 */}
          <section>
            <TaskStats tasks={tasks} />
          </section>

          {/* 过滤选项卡 */}
          <section>
            <FilterTabs 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />
          </section>

          {/* 添加任务表单 */}
          <section>
            <TaskForm onSubmit={handleAddTask} isSubmitting={isSubmitting} />
          </section>

          {/* 任务列表 */}
          <section>
            {isLoading ? (
              <div className="py-10 flex justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-500 dark:text-gray-400">加载中...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <EmptyState 
                  message={
                    activeFilter === 'all' ? '暂无任务，添加一个新任务开始吧！' :
                    activeFilter === 'active' ? '没有进行中的任务！' :
                    '没有已完成的任务！'
                  }
                  icon="clipboard"
                />
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredTasks.map(task => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteTask}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
      {/* 通知组件 */}
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}
