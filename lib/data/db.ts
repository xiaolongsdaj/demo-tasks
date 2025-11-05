import { Task } from '../types';
import mysql, { Pool, RowDataPacket } from 'mysql2/promise';

// 数据库配置接口
interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  connectionLimit: number;
}

// 数据库连接池
let pool: Pool | null = null;

// 加载数据库配置
const loadDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'task_manager',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10')
  };
  return config;
};

// 初始化数据库连接
const initDatabaseConnection = async (): Promise<Pool> => {
  if (pool) {
    return pool;
  }

  try {
    const config = loadDatabaseConfig();
    pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
      connectionLimit: config.connectionLimit,
      ssl: process.env.MYSQL_SSL === 'true' ? {} : undefined
    });

    // 验证连接
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();

    // 初始化表结构
    await initTables();
    
    return pool;
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
};

// 初始化表结构
async function initTables() {
  if (!pool) return;
  
  try {
    const connection = await pool.getConnection();
    try {
      // 创建tasks表
      await connection.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to initialize tables:', error);
    throw error;
  }
}

// 在开发环境中，如果MySQL连接失败，可以使用内存存储作为备用
let memoryFallback: Task[] = [];
let useMemoryFallback = false;

// 初始化数据库
export const initDatabase = async (): Promise<void> => {
  try {
    await initDatabaseConnection();
  } catch (error) {
    console.warn('MySQL connection failed, using memory fallback:', error);
    useMemoryFallback = true;
    
    // 初始化内存存储的示例数据
    if (memoryFallback.length === 0) {
      memoryFallback = [
        { id: 1, title: '示例任务 1', completed: false, createdAt: new Date().toISOString() },
        { id: 2, title: '示例任务 2', completed: true, createdAt: new Date().toISOString() }
      ];
    }
  }
};

// 基础查询执行函数
async function executeQuery<T>(sql: string, params?: any[]): Promise<T> {
  const db = await initDatabaseConnection();
  const [rows] = await db.query(sql, params);
  return rows as T;
}

// 获取所有任务
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    if (useMemoryFallback) {
      return [...memoryFallback].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    const rows = await executeQuery<RowDataPacket[]>(
      'SELECT id, title, completed, created_at as createdAt FROM tasks ORDER BY created_at DESC'
    );
    
    return rows as unknown as Task[];
  } catch (error) {
    console.error('Failed to get tasks:', error);
    throw error;
  }
};

// 创建新任务
export const createTask = async (title: string): Promise<Task> => {
  try {
    // 验证输入
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('任务标题不能为空');
    }
    
    if (useMemoryFallback) {
      const newTask: Task = {
        id: memoryFallback.length > 0 ? Math.max(...memoryFallback.map(t => t.id)) + 1 : 1,
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      memoryFallback.unshift(newTask);
      return newTask;
    }

    const result = await executeQuery<any>(
      'INSERT INTO tasks (title, completed, created_at) VALUES (?, ?, NOW())',
      [title.trim(), false]
    );
    
    const insertedId = result.insertId;
    
    return {
      id: insertedId,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};

// 更新任务
export const updateTask = async (id: number, updates: Partial<Task>): Promise<Task | null> => {
  try {
    // 验证输入
    if (typeof id !== 'number' || isNaN(id) || id <= 0) {
      throw new Error('无效的任务ID');
    }
    
    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || updates.title.trim() === '') {
        throw new Error('任务标题必须是非空字符串');
      }
    }
    
    if (updates.completed !== undefined && typeof updates.completed !== 'boolean') {
      throw new Error('完成状态必须是布尔值');
    }
    
    if (useMemoryFallback) {
      const taskIndex = memoryFallback.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        return null;
      }
      
      const updatedTask = { 
        ...memoryFallback[taskIndex], 
        ...updates,
        ...(updates.title && { title: updates.title.trim() })
      };
      
      memoryFallback[taskIndex] = updatedTask;
      return updatedTask;
    }

    // 检查任务是否存在
    const existingRows = await executeQuery<RowDataPacket[]>('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return null;
    }
    
    // 准备更新语句
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title.trim());
    }
    
    if (updates.completed !== undefined) {
      updateFields.push('completed = ?');
      updateValues.push(updates.completed);
    }
    
    if (updateFields.length === 0) {
      return existingRows[0] as unknown as Task;
    }
    
    updateValues.push(id);
    
    await executeQuery(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // 获取更新后的任务
    const updatedRows = await executeQuery<RowDataPacket[]>(
      'SELECT id, title, completed, created_at as createdAt FROM tasks WHERE id = ?',
      [id]
    );
    
    return updatedRows[0] as unknown as Task;
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
};

// 删除任务
export const deleteTask = async (id: number): Promise<boolean> => {
  try {
    // 验证输入
    if (typeof id !== 'number' || isNaN(id) || id <= 0) {
      throw new Error('无效的任务ID');
    }
    
    if (useMemoryFallback) {
      const initialLength = memoryFallback.length;
      memoryFallback = memoryFallback.filter(t => t.id !== id);
      return memoryFallback.length < initialLength;
    }

    const result = await executeQuery<any>('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
};

// 获取单个任务
export const getTaskById = async (id: number): Promise<Task | null> => {
  try {
    // 验证输入
    if (typeof id !== 'number' || isNaN(id) || id <= 0) {
      throw new Error('无效的任务ID');
    }
    
    if (useMemoryFallback) {
      return memoryFallback.find(t => t.id === id) || null;
    }

    const rows = await executeQuery<RowDataPacket[]>(
      'SELECT id, title, completed, created_at as createdAt FROM tasks WHERE id = ?',
      [id]
    );
    
    return rows.length > 0 ? (rows[0] as unknown as Task) : null;
  } catch (error) {
    console.error('Failed to get task by id:', error);
    throw error;
  }
};

// 关闭数据库连接（可选，用于测试或清理）
export const closeDatabaseConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};