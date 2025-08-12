import { BaseApiService, ApiResponse, PagedResult } from './baseApi';
import { Task, CreateTaskCommand, UpdateTaskCommand, TaskStatus, TaskPriority } from '../../types';

export interface TaskFiltersDto {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: number;
  assigneeId?: string;
  dueDateRange?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

class TasksApiService extends BaseApiService {
  async getTasks(filters?: TaskFiltersDto): Promise<ApiResponse<PagedResult<Task>>> {
    const queryString = filters ? this.buildQueryString(filters as Record<string, unknown>) : '';
    return this.get<PagedResult<Task>>(`/tasks${queryString}`);
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return this.get<Task>(`/tasks/${id}`);
  }

  async createTask(command: CreateTaskCommand): Promise<ApiResponse<Task>> {
    return this.post<Task>('/tasks', command);
  }

  async updateTask(id: string, command: UpdateTaskCommand): Promise<ApiResponse<Task>> {
    return this.put<Task>(`/tasks/${id}`, command);
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/tasks/${id}`);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<ApiResponse<Task>> {
    return this.put<Task>(`/tasks/${id}/status`, { status });
  }

  async assignTask(id: string, assigneeId: string): Promise<ApiResponse<Task>> {
    return this.put<Task>(`/tasks/${id}/assign`, { assigneeId });
  }

  async getTasksByProject(projectId: number, filters?: TaskFiltersDto): Promise<ApiResponse<PagedResult<Task>>> {
    const params = { ...filters, projectId };
    const queryString = this.buildQueryString(params);
    return this.get<PagedResult<Task>>(`/tasks/by-project/${projectId}${queryString}`);
  }

  async getTasksByAssignee(assigneeId: string, filters?: TaskFiltersDto): Promise<ApiResponse<PagedResult<Task>>> {
    const params = { ...filters, assigneeId };
    const queryString = this.buildQueryString(params);
    return this.get<PagedResult<Task>>(`/tasks/by-assignee/${assigneeId}${queryString}`);
  }

  async getOverdueTasks(): Promise<ApiResponse<PagedResult<Task>>> {
    return this.get<PagedResult<Task>>('/tasks/overdue');
  }

  async getTasksForToday(): Promise<ApiResponse<PagedResult<Task>>> {
    return this.get<PagedResult<Task>>('/tasks/today');
  }

  async getTasksForThisWeek(): Promise<ApiResponse<PagedResult<Task>>> {
    return this.get<PagedResult<Task>>('/tasks/this-week');
  }
}

export const tasksApi = new TasksApiService();
