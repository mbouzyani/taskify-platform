import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, UserPlus, Mail, MapPin, Briefcase, AlertCircle, Users, Share2 } from 'lucide-react';
import { InviteTeamMemberCommand, UserRole, Position, TeamMember, UpdateTeamMemberCommand } from '../../types';
import { TeamMemberCard } from './TeamMemberCard';
import { InviteMemberModal } from './InviteMemberModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useTeam } from '../../hooks/useTeam';
import { teamApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export const TeamView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterRoles, setFilterRoles] = useState<UserRole[]>([]);
  const [filterPositions, setFilterPositions] = useState<Position[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'department' | 'position'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; memberId: string | null; memberName?: string }>({
    isOpen: false,
    memberId: null,
    memberName: undefined
  });
  const { showSuccess, showError } = useToast();

  // Use the team hook
  const { 
    teamMembers, 
    loading, 
    error, 
    refetch 
  } = useTeam();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to clear search if focused
      if (event.key === 'Escape') {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput && document.activeElement === searchInput) {
          if (searchQuery) {
            setSearchQuery('');
          } else {
            searchInput.blur();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Client-side filtering and sorting
  const filteredMembers = useMemo(() => {
    const filtered = teamMembers.filter(member => {
      const matchesSearch = !debouncedSearchQuery || 
        member.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesRole = filterRoles.length === 0 || filterRoles.includes(member.role);
      const matchesPosition = filterPositions.length === 0 || filterPositions.includes(member.position);
      const matchesDepartment = filterDepartments.length === 0 || 
        filterDepartments.some(dept => {
          if (dept === 'unassigned') return !member.department;
          return member.department && member.department.toLowerCase() === dept.toLowerCase();
        });
      
      return matchesSearch && matchesRole && matchesPosition && matchesDepartment;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'role': {
          // Sort by role priority: Admin > Project Manager > Member
          const roleOrder = { [UserRole.ADMIN]: 0, [UserRole.PROJECT_MANAGER]: 1, [UserRole.MEMBER]: 2 };
          compareValue = roleOrder[a.role] - roleOrder[b.role];
          break;
        }
        case 'department': {
          const aDept = a.department || 'ZZZ_Unassigned';
          const bDept = b.department || 'ZZZ_Unassigned';
          compareValue = aDept.localeCompare(bDept);
          break;
        }
        case 'position':
          compareValue = a.position - b.position;
          break;
        default:
          compareValue = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [teamMembers, debouncedSearchQuery, filterRoles, filterPositions, filterDepartments, sortBy, sortOrder]);

  const handleInviteMember = async (memberData: InviteTeamMemberCommand) => {
    try {
      const response = await teamApi.inviteTeamMember(memberData);
      if (response.success) {
        setIsInviteModalOpen(false);
        showSuccess(
          'Team Member Invited!',
          `${memberData.name} has been successfully added to the team.`
        );
        refetch(); // Refresh the team members list
      } else {
        throw new Error(response.message || 'Failed to invite team member');
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      showError(
        'Invitation Failed',
        error instanceof Error ? error.message : 'Failed to invite team member. Please try again.'
      );
      // Don't re-throw the error to prevent it from bubbling up to the modal
    }
  };

  const handleDeleteMember = (memberId: string) => {
    const memberToDelete = teamMembers.find(m => m.id === memberId);
    setDeleteConfirm({ 
      isOpen: true, 
      memberId, 
      memberName: memberToDelete?.name 
    });
  };

  const confirmDeleteMember = async () => {
    if (!deleteConfirm.memberId) return;

    const memberToDelete = teamMembers.find(m => m.id === deleteConfirm.memberId);

    try {
      const response = await teamApi.deleteTeamMember(deleteConfirm.memberId);
      if (response.success) {
        showSuccess(
          'Team Member Removed',
          memberToDelete ? `${memberToDelete.name} has been removed from the team.` : 'Team member has been removed successfully.'
        );
        refetch(); // Refresh the team members list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      showError(
        'Deletion Failed',
        error instanceof Error ? error.message : 'Failed to remove team member. Please try again.'
      );
    } finally {
      setDeleteConfirm({ isOpen: false, memberId: null, memberName: undefined });
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setIsInviteModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setFilterRoles([]);
    setFilterPositions([]);
    setFilterDepartments([]);
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchQuery || filterRoles.length > 0 || filterPositions.length > 0 || filterDepartments.length > 0 || sortBy !== 'name' || sortOrder !== 'asc';

  // Helper functions for managing multi-select filters
  const toggleRoleFilter = (role: UserRole) => {
    setFilterRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const togglePositionFilter = (position: Position) => {
    setFilterPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const toggleDepartmentFilter = (department: string) => {
    setFilterDepartments(prev => 
      prev.includes(department) 
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  // Quick filter presets
  const applyQuickFilter = (type: 'admins' | 'managers' | 'developers' | 'all') => {
    switch (type) {
      case 'admins':
        setFilterRoles([UserRole.ADMIN]);
        setFilterPositions([]);
        setFilterDepartments([]);
        break;
      case 'managers':
        setFilterRoles([UserRole.PROJECT_MANAGER, UserRole.ADMIN]);
        setFilterPositions([]);
        setFilterDepartments([]);
        break;
      case 'developers':
        setFilterRoles([]);
        setFilterPositions([Position.FRONTEND_DEVELOPER, Position.BACKEND_DEVELOPER, Position.FULLSTACK_DEVELOPER]);
        setFilterDepartments([]);
        break;
      case 'all':
        clearFilters();
        break;
    }
  };

  // URL state management for filters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rolesParam = params.get('roles');
    const positionsParam = params.get('positions');
    const departmentsParam = params.get('departments');
    const searchParam = params.get('search');
    const sortByParam = params.get('sortBy');
    const sortOrderParam = params.get('sortOrder');

    if (rolesParam) {
      setFilterRoles(rolesParam.split(',').map(r => parseInt(r) as UserRole));
    }
    if (positionsParam) {
      setFilterPositions(positionsParam.split(',').map(p => parseInt(p) as Position));
    }
    if (departmentsParam) {
      setFilterDepartments(departmentsParam.split(','));
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (sortByParam) {
      setSortBy(sortByParam as 'name' | 'role' | 'department' | 'position');
    }
    if (sortOrderParam) {
      setSortOrder(sortOrderParam as 'asc' | 'desc');
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filterRoles.length > 0) {
      params.set('roles', filterRoles.join(','));
    }
    if (filterPositions.length > 0) {
      params.set('positions', filterPositions.join(','));
    }
    if (filterDepartments.length > 0) {
      params.set('departments', filterDepartments.join(','));
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    if (sortBy !== 'name') {
      params.set('sortBy', sortBy);
    }
    if (sortOrder !== 'asc') {
      params.set('sortOrder', sortOrder);
    }

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filterRoles, filterPositions, filterDepartments, searchQuery, sortBy, sortOrder]);

  const copyFilterUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess('Filter URL Copied', 'The current filter settings have been copied to your clipboard.');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      showError('Copy Failed', 'Unable to copy the filter URL to clipboard.');
    }
  };

  const handleUpdateMember = async (memberId: string, memberData: InviteTeamMemberCommand) => {
    try {
      const updateCommand: UpdateTeamMemberCommand = {
        id: memberId,
        name: memberData.name,
        role: memberData.role,
        position: memberData.position,
        department: memberData.department,
      };
      
      const response = await teamApi.updateTeamMember(memberId, updateCommand);
      if (response.success) {
        setIsInviteModalOpen(false);
        setEditingMember(null);
        showSuccess(
          'Team Member Updated!',
          `${memberData.name} has been successfully updated.`
        );
        refetch(); // Refresh the team members list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to update team member:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: UserRole.ADMIN, label: 'Admin' },
    { value: UserRole.PROJECT_MANAGER, label: 'Project Manager' },
    { value: UserRole.MEMBER, label: 'Member' },
  ];

  const positionOptions = [
    { value: 'all', label: 'All Positions' },
    { value: Position.TEAM_MEMBER, label: 'Team Member' },
    { value: Position.TEAM_LEAD, label: 'Team Lead' },
    { value: Position.PROJECT_MANAGER, label: 'Project Manager' },
    { value: Position.FRONTEND_DEVELOPER, label: 'Frontend Developer' },
    { value: Position.BACKEND_DEVELOPER, label: 'Backend Developer' },
    { value: Position.FULLSTACK_DEVELOPER, label: 'Fullstack Developer' },
    { value: Position.DEVOPS_ENGINEER, label: 'DevOps Engineer' },
    { value: Position.QA_ENGINEER, label: 'QA Engineer' },
    { value: Position.UIUX_DESIGNER, label: 'UI/UX Designer' },
  ];

  // Get unique departments from team members
  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    teamMembers.forEach(member => {
      if (member.department) {
        departments.add(member.department);
      }
    });
    
    const options = [{ value: 'all', label: 'All Departments' }];
    if (departments.size > 0) {
      Array.from(departments).sort().forEach(dept => {
        options.push({ value: dept.toLowerCase(), label: dept });
      });
    }
    // Add option for members without department
    const hasUnassigned = teamMembers.some(member => !member.department);
    if (hasUnassigned) {
      options.push({ value: 'unassigned', label: 'Unassigned' });
    }
    
    return options;
  }, [teamMembers]);

  // Calculate statistics
  const totalMembers = teamMembers.length;
  const adminCount = teamMembers.filter(m => m.role === UserRole.ADMIN).length;
  const pmCount = teamMembers.filter(m => m.role === UserRole.PROJECT_MANAGER).length;
  const memberCount = teamMembers.filter(m => m.role === UserRole.MEMBER).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Unable to load team members</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
              {hasActiveFilters && (
                <p className="text-xs text-blue-600 mt-1">
                  {filteredMembers.length} filtered
                </p>
              )}
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
            </div>
            <Briefcase className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Project Managers</p>
              <p className="text-2xl font-bold text-gray-900">{pmCount}</p>
            </div>
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{memberCount}</p>
            </div>
            <Mail className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Filter Status and Search Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Filter className="w-4 h-4" />
                  <span>
                    {filteredMembers.length} of {teamMembers.length} members
                  </span>
                </div>
                
                {/* Active Filter Tags */}
                {filterRoles.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Roles:</span>
                    {filterRoles.map(role => (
                      <span key={role} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {roleOptions.find(opt => opt.value === role)?.label}
                        <button
                          onClick={() => toggleRoleFilter(role)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {filterPositions.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Positions:</span>
                    {filterPositions.map(position => (
                      <span key={position} className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {positionOptions.find(opt => opt.value === position)?.label}
                        <button
                          onClick={() => togglePositionFilter(position)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {filterDepartments.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Departments:</span>
                    {filterDepartments.map(dept => (
                      <span key={dept} className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {departmentOptions.find(opt => opt.value === dept)?.label}
                        <button
                          onClick={() => toggleDepartmentFilter(dept)}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex gap-2">
                <button
                  onClick={copyFilterUrl}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                  title="Copy filter URL to share these filter settings"
                >
                  <Share2 className="w-4 h-4" />
                  Share Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Quick Filter Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
            <button
              onClick={() => applyQuickFilter('all')}
              className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              All Members
            </button>
            <button
              onClick={() => applyQuickFilter('admins')}
              className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Admins Only
            </button>
            <button
              onClick={() => applyQuickFilter('managers')}
              className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
            >
              Management
            </button>
            <button
              onClick={() => applyQuickFilter('developers')}
              className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              Developers
            </button>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Role Filter - Multi-select */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Roles</label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.slice(1).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleRoleFilter(option.value as UserRole)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filterRoles.includes(option.value as UserRole)
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Filter - Multi-select */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Positions</label>
              <div className="flex flex-wrap gap-2">
                {positionOptions.slice(1).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => togglePositionFilter(option.value as Position)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filterPositions.includes(option.value as Position)
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Department Filter - Multi-select */}
            {departmentOptions.length > 1 && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Departments</label>
                <div className="flex flex-wrap gap-2">
                  {departmentOptions.slice(1).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleDepartmentFilter(option.value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        filterDepartments.includes(option.value)
                          ? 'bg-purple-100 border-purple-300 text-purple-800'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'role' | 'department' | 'position')}
                aria-label="Sort team members by"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="department">Department</option>
                <option value="position">Position</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-500 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters' 
              : 'Invite your first team member to get started'
            }
          </p>
          {!hasActiveFilters && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setEditingMember(null);
        }}
        onInvite={handleInviteMember}
        onUpdate={handleUpdateMember}
        editingMember={editingMember}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, memberId: null, memberName: undefined })}
        onConfirm={confirmDeleteMember}
        title="Remove Team Member"
        message={deleteConfirm.memberName 
          ? `Are you sure you want to remove ${deleteConfirm.memberName} from the team? This action cannot be undone and will remove all their task assignments.`
          : "Are you sure you want to remove this team member? This action cannot be undone and will remove all their task assignments."
        }
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
