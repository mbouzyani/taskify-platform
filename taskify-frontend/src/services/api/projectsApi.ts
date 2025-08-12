import { BaseApiService, ApiResponse, PagedResult } from './baseApi';
import { Project, CreateProjectCommand, UpdateProjectCommand, ProjectStatus, ProjectMember, Task } from '../../types';

export interface ProjectFiltersDto {
  search?: string;
  status?: ProjectStatus[];
  page?: number;
  pageSize?: number;
}

export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
  completionPercentage: number;
  totalMembers: number;
  activeMembers: number;
}

class ProjectsApiService extends BaseApiService {
  async getProjects(filters?: ProjectFiltersDto): Promise<ApiResponse<Project[]>> {
    const queryString = filters ? this.buildQueryString(filters as Record<string, unknown>) : '';
    const endpoint = `/projects${queryString}`;
    const response = await this.get<Project[]>(endpoint);
    return response;
  }

  async getProjectById(id: number): Promise<ApiResponse<Project>> {
    return this.get<Project>(`/projects/${id}`);
  }

  async createProject(command: CreateProjectCommand): Promise<ApiResponse<Project>> {
    return this.post<Project>('/projects', command);
  }

  async updateProject(id: number, command: UpdateProjectCommand): Promise<ApiResponse<Project>> {
    return this.put<Project>(`/projects/${id}`, command);
  }

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/projects/${id}`);
  }

  async updateProjectStatus(id: number, status: ProjectStatus): Promise<ApiResponse<Project>> {
    return this.put<Project>(`/projects/${id}/status`, { status });
  }

  async getProjectMembers(id: number): Promise<ApiResponse<ProjectMember[]>> {
    return this.get<ProjectMember[]>(`/projects/${id}/members`);
  }

  async addProjectMember(id: number, memberId: string): Promise<ApiResponse<void>> {
    return this.post<void>(`/projects/${id}/members`, { memberId });
  }

  async removeProjectMember(id: number, memberId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/projects/${id}/members/${memberId}`);
  }

  async getProjectTasks(id: number): Promise<ApiResponse<Task[]>> {
    return this.get<Task[]>(`/projects/${id}/tasks`);
  }

  async getProjectStatistics(id: number): Promise<ApiResponse<ProjectStatistics>> {
    return this.get<ProjectStatistics>(`/projects/${id}/statistics`);
  }

  async getActiveProjects(): Promise<ApiResponse<PagedResult<Project>>> {
    return this.get<PagedResult<Project>>('/projects/active');
  }

  async getCompletedProjects(): Promise<ApiResponse<PagedResult<Project>>> {
    return this.get<PagedResult<Project>>('/projects/completed');
  }
}

export const projectsApi = new ProjectsApiService();
