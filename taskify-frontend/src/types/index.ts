export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  projectName: string;
  projectColor: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  REVIEW = 2,
  COMPLETED = 3
}

export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  URGENT = 3
}

export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  createdAt: string;
  taskCount: number;
  completedTasks: number;
  completionPercentage: number;
  todoTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  assignedMembers: ProjectMember[];
  totalMembers: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  position: Position;
}

export interface CreateProjectCommand {
  name: string;
  description: string;
  color: string;
  memberIds?: string[];
}

export interface UpdateProjectCommand {
  id: number;
  name: string;
  description: string;
  color: string;
  memberIds?: string[];
}

export interface CreateTaskCommand {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskCommand {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId?: string;
  dueDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  position: Position;
  department?: string;
  assignedProjects: AssignedProject[];
  stats?: TeamMemberStats;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export enum UserRole {
  MEMBER = 0,
  PROJECT_MANAGER = 1,
  ADMIN = 2
}

export enum Position {
  TEAM_MEMBER = 0,
  TEAM_LEAD = 1,
  PROJECT_MANAGER = 2,
  DIRECTOR = 3,
  EXECUTIVE = 4,
  FRONTEND_DEVELOPER = 5,
  BACKEND_DEVELOPER = 6,
  FULLSTACK_DEVELOPER = 7,
  DEVOPS_ENGINEER = 8,
  QA_ENGINEER = 9,
  UIUX_DESIGNER = 10,
  DATA_ANALYST = 11,
  PRODUCT_MANAGER = 12,
  TECHNICAL_LEAD = 13,
  SOFTWARE_ARCHITECT = 14,
  BUSINESS_ANALYST = 15,
  SYSTEM_ADMINISTRATOR = 16,
  DATABASE_ADMINISTRATOR = 17,
  SECURITY_ENGINEER = 18,
  MOBILE_APP_DEVELOPER = 19
}

export interface AssignedProject {
  id: number;
  name: string;
  color: string;
  status: ProjectStatus;
  assignedAt: string;
}

export enum ProjectStatus {
  ACTIVE = 0,
  ON_HOLD = 1,
  COMPLETED = 2,
  ARCHIVED = 3
}

export interface TeamMemberStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTaskCompletionTime: string; // TimeSpan as string
  tasksByProject: TasksByProject[];
}

export interface TasksByProject {
  projectId: number;
  projectName: string;
  taskCount: number;
  completedTasks: number;
}

export interface CreateTeamMemberCommand {
  name: string;
  email: string;
  role: UserRole;
  position: Position;
  department?: string;
}

export interface InviteTeamMemberCommand {
  name: string;
  email: string;
  role: UserRole;
  position: Position;
  department?: string;
}

export interface UpdateTeamMemberCommand {
  id: string;
  name?: string;
  avatar?: string;
  role?: UserRole;
  position?: Position;
  department?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: number;
  assigneeId?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface TasksResponse {
  tasks: Task[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  tasksCompletedThisWeek: number;
  productivityScore: number;
}