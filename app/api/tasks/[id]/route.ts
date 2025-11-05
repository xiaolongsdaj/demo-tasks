import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '../../../../lib/data/db';
import { ApiResponse, Task, UpdateTaskRequest } from '../../../../lib/types';

// 获取任务ID并验证格式
function validateTaskId(id: string): number | null {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return null;
  }
  return numId;
}

// PATCH 方法：更新任务
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = validateTaskId(paramId);
    if (!id) {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '无效的任务ID'
      }, { status: 400 });
    }
    
    // 检查请求体是否为空
    const rawBody = await request.text();
    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '请求体不能为空'
      }, { status: 400 });
    }
    
    let body: UpdateTaskRequest;
    try {
      body = JSON.parse(rawBody) as UpdateTaskRequest;
    } catch (parseError) {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '无效的JSON格式'
      }, { status: 400 });
    }
    
    // 验证更新数据
    if (!body || (body.completed === undefined && body.title === undefined)) {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '没有提供要更新的字段'
      }, { status: 400 });
    }
    
    if (body.title !== undefined) {
      if (typeof body.title !== 'string') {
        return NextResponse.json<ApiResponse<Task>>({
          success: false,
          error: '任务标题必须是字符串类型'
        }, { status: 400 });
      }
      if (body.title.trim() === '') {
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
    }
    
    if (body.completed !== undefined && typeof body.completed !== 'boolean') {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '完成状态必须是布尔值'
      }, { status: 400 });
    }
    
    const updatedTask = await updateTask(id, body);
    
    if (!updatedTask) {
      return NextResponse.json<ApiResponse<Task>>({
        success: false,
        error: '任务不存在或更新失败'
      }, { status: 404 });
    }
    
    return NextResponse.json<ApiResponse<Task>>({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json<ApiResponse<Task>>({
      success: false,
      error: error instanceof Error ? error.message : '更新任务失败'
    }, { status: 500 });
  }
}

// DELETE 方法：删除任务
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = validateTaskId(paramId);
    if (!id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的任务ID'
      }, { status: 400 });
    }
    
    // 先检查任务是否存在
    const existingTask = await getTaskById(id);
    if (!existingTask) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '任务不存在'
      }, { status: 404 });
    }
    
    const result = await deleteTask(id);
    
    if (!result) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '删除任务失败'
      }, { status: 500 });
    }
    
    return NextResponse.json<ApiResponse<null>>({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : '删除任务失败'
    }, { status: 500 });
  }
}