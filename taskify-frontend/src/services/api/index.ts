// Export all API services
export { tasksApi } from './tasksApi';
export { projectsApi } from './projectsApi';
export { teamApi } from './teamApi';
export { dashboardApi } from './dashboardApi';
export { BaseApiService } from './baseApi';

// Export types
export type { ApiResponse, PagedResult } from './baseApi';
export type { TaskFiltersDto } from './tasksApi';
export type { ProjectFiltersDto, ProjectStatistics } from './projectsApi';
export type { TeamFiltersDto, TeamStatistics } from './teamApi';
export type { 
  OverviewStats, 
  RecentActivity, 
  TasksByStatus, 
  TasksByPriority, 
  ProjectProgress,
  TeamPerformance,
  ProductivityTrend,
  WorkloadDistribution
} from './dashboardApi';
