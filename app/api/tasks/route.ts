import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask, initDatabase } from '../../../lib/data/db';
import { Task, ApiResponse, CreateTaskRequest } from '../../../lib/types';

export async function GET() {
  try {
    await initDatabase();
    const tasks = await getAllTasks();
    return NextResponse.json<ApiResponse<Task[]>>({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json<ApiResponse<Task[]>>({
      success: false,
      error: error instanceof Error ? error.message : '获取任务失败'
    }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '请求体不能为空'
      }, { status: 400 });
    }
    
    let body: CreateTaskRequest;
    try {
      body = JSON.parse(rawBody) as CreateTaskRequest;
    } catch (parseError) {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '无效的JSON格式'
      }, { status: 400 });
    }
    
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '任务标题不能为空'
      }, { status: 400 });
    }
    
    if (body.title.length > 200) {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '任务标题长度不能超过200个字符'
      }, { status: 400 });
    }
    
    const newTask = await createTask(body.title.trim());
    
    return NextResponse.json<ApiResponse<Task>>({
      success: true,
      data: newTask
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json<ApiResponse<Task>>({
      success: false,
      error: error instanceof Error ? error.message : '创建任务失败'
    }, { status: 500 });
  }
}