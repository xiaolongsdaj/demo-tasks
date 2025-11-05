// 任务类型定义
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 创建任务请求类型
export interface CreateTaskRequest {
  title: string;
}

// 更新任务请求类型
export interface UpdateTaskRequest {
  title?: string;
  completed?: boolean;
}