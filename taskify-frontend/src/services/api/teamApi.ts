import { BaseApiService, ApiResponse, PagedResult } from './baseApi';
import { TeamMember, CreateTeamMemberCommand, UpdateTeamMemberCommand, InviteTeamMemberCommand, UserRole, Position } from '../../types';
import { API_CONFIG } from '../../config/api';

export interface TeamFiltersDto {
  search?: string;
  role?: UserRole[];
  position?: Position[];
  department?: string[];
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TeamStatistics {
  totalMembers: number;
  activeMembers: number;
  adminCount: number;
  projectManagerCount: number;
  memberCount: number;
  departmentBreakdown: Record<string, number>;
  positionBreakdown: Record<string, number>;
}

class TeamApiService extends BaseApiService {
  async getTeamMembers(includeTaskStats: boolean = false): Promise<ApiResponse<TeamMember[]>> {
    try {
      const queryString = includeTaskStats ? '?includeTaskStats=true' : '';
      const endpoint = `${API_CONFIG.ENDPOINTS.TEAM}/members${queryString}`;
      console.log('Fetching team members from:', endpoint);
      const response = await this.get<TeamMember[]>(endpoint);
      console.log('Team members response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  async getTeamMemberById(id: string): Promise<ApiResponse<TeamMember>> {
    return this.get<TeamMember>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}`);
  }

  async createTeamMember(command: CreateTeamMemberCommand): Promise<ApiResponse<TeamMember>> {
    return this.post<TeamMember>(`${API_CONFIG.ENDPOINTS.TEAM}/invite`, command);
  }

  async inviteTeamMember(command: InviteTeamMemberCommand): Promise<ApiResponse<TeamMember>> {
    return this.post<TeamMember>(`${API_CONFIG.ENDPOINTS.TEAM}/invite`, command);
  }

  async updateTeamMember(id: string, command: UpdateTeamMemberCommand): Promise<ApiResponse<TeamMember>> {
    return this.put<TeamMember>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}`, command);
  }

  async deleteTeamMember(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}`);
  }

  async updateMemberRole(id: string, role: UserRole): Promise<ApiResponse<TeamMember>> {
    return this.put<TeamMember>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}/role`, { role });
  }

  async updateMemberPosition(id: string, position: Position): Promise<ApiResponse<TeamMember>> {
    return this.put<TeamMember>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}/position`, { position });
  }

  async updateMemberDepartment(id: string, department: string): Promise<ApiResponse<TeamMember>> {
    return this.put<TeamMember>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}/department`, { department });
  }

  async deactivateMember(id: string): Promise<ApiResponse<void>> {
    return this.put<void>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}/deactivate`, {});
  }

  async activateMember(id: string): Promise<ApiResponse<void>> {
    return this.put<void>(`${API_CONFIG.ENDPOINTS.TEAM}/members/${id}/activate`, {});
  }

  async getTeamStatistics(): Promise<ApiResponse<TeamStatistics>> {
    return this.get<TeamStatistics>(`${API_CONFIG.ENDPOINTS.TEAM}/statistics`);
  }

  async getMembersByDepartment(department: string): Promise<ApiResponse<PagedResult<TeamMember>>> {
    return this.get<PagedResult<TeamMember>>(`${API_CONFIG.ENDPOINTS.TEAM}/by-department/${department}`);
  }

  async getMembersByRole(role: UserRole): Promise<ApiResponse<PagedResult<TeamMember>>> {
    return this.get<PagedResult<TeamMember>>(`${API_CONFIG.ENDPOINTS.TEAM}/by-role/${role}`);
  }

  async getActiveMembersCount(): Promise<ApiResponse<number>> {
    return this.get<number>(`${API_CONFIG.ENDPOINTS.TEAM}/active-count`);
  }

  async resetMemberPassword(id: string): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return this.post<{ temporaryPassword: string }>(`${API_CONFIG.ENDPOINTS.TEAM}/${id}/reset-password`, {});
  }
}

export const teamApi = new TeamApiService();
