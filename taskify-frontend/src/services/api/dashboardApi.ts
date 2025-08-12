import { BaseApiService, ApiResponse } from './baseApi';
import { DashboardStats, Task, Project } from '../../types';

export interface OverviewStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  completionRate: number;
  productivity: number;
}

export interface RecentActivity {
  id: string;
  type: 'task_created' | 'task_completed' | 'project_created' | 'member_added';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export interface TasksByStatus {
  todo: number;
  inProgress: number;
  review: number;
  completed: number;
}

export interface TasksByPriority {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export interface ProjectProgress {
  id: number;
  name: string;
  completion: number;
  totalTasks: number;
  completedTasks: number;
  dueDate?: string;
  status: string;
}

export interface TeamPerformance {
  memberId: string;
  memberName: string;
  tasksCompleted: number;
  tasksInProgress: number;
  productivity: number;
  efficiency: number;
}

export interface ProductivityTrend {
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  productivity: number;
}

export interface WorkloadDistribution {
  memberId: string;
  memberName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  workloadPercentage: number;
}

class DashboardApiService extends BaseApiService {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<DashboardStats>('/dashboard/stats');
  }

  async getOverviewStats(): Promise<ApiResponse<OverviewStats>> {
    return this.get<OverviewStats>('/dashboard/overview');
  }

  async getRecentActivity(limit?: number): Promise<ApiResponse<RecentActivity[]>> {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.get<RecentActivity[]>(`/dashboard/recent-activity${queryString}`);
  }

  async getTasksByStatus(): Promise<ApiResponse<TasksByStatus>> {
    return this.get<TasksByStatus>('/dashboard/tasks-by-status');
  }

  async getTasksByPriority(): Promise<ApiResponse<TasksByPriority>> {
    return this.get<TasksByPriority>('/dashboard/tasks-by-priority');
  }

  async getProjectProgress(): Promise<ApiResponse<ProjectProgress[]>> {
    return this.get<ProjectProgress[]>('/dashboard/project-progress');
  }

  async getUpcomingDeadlines(): Promise<ApiResponse<Task[]>> {
    return this.get<Task[]>('/dashboard/upcoming-deadlines');
  }

  async getMyTasks(): Promise<ApiResponse<Task[]>> {
    return this.get<Task[]>('/dashboard/my-tasks');
  }

  async getMyProjects(): Promise<ApiResponse<Project[]>> {
    return this.get<Project[]>('/dashboard/my-projects');
  }

  async getTeamPerformance(): Promise<ApiResponse<TeamPerformance[]>> {
    return this.get<TeamPerformance[]>('/dashboard/team-performance');
  }

  async getProductivityTrends(period?: string): Promise<ApiResponse<ProductivityTrend[]>> {
    const queryString = period ? `?period=${period}` : '';
    return this.get<ProductivityTrend[]>(`/dashboard/productivity-trends${queryString}`);
  }

  async getWorkloadDistribution(): Promise<ApiResponse<WorkloadDistribution[]>> {
    return this.get<WorkloadDistribution[]>('/dashboard/workload-distribution');
  }
}

export const dashboardApi = new DashboardApiService();
