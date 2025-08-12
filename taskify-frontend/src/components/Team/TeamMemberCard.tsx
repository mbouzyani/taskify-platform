import React, { useState } from 'react';
import { Mail, MapPin, Briefcase, MoreVertical, Trash2, Edit, Star } from 'lucide-react';
import { TeamMember, UserRole, Position } from '../../types';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.PROJECT_MANAGER:
        return 'bg-purple-100 text-purple-800';
      case UserRole.MEMBER:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionIcon = (position: Position) => {
    switch (position) {
      case Position.TEAM_LEAD:
      case Position.TECHNICAL_LEAD:
      case Position.PROJECT_MANAGER:
      case Position.DIRECTOR:
      case Position.EXECUTIVE:
        return <Star className="w-3 h-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatRole = (role: UserRole) => {
    switch (role) {
      case UserRole.PROJECT_MANAGER:
        return 'Project Manager';
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.MEMBER:
        return 'Member';
      default:
        return 'Member';
    }
  };

  const formatPosition = (position: Position) => {
    switch (position) {
      case Position.TEAM_MEMBER:
        return 'Team Member';
      case Position.TEAM_LEAD:
        return 'Team Lead';
      case Position.PROJECT_MANAGER:
        return 'Project Manager';
      case Position.DIRECTOR:
        return 'Director';
      case Position.EXECUTIVE:
        return 'Executive';
      case Position.FRONTEND_DEVELOPER:
        return 'Frontend Developer';
      case Position.BACKEND_DEVELOPER:
        return 'Backend Developer';
      case Position.FULLSTACK_DEVELOPER:
        return 'Fullstack Developer';
      case Position.DEVOPS_ENGINEER:
        return 'DevOps Engineer';
      case Position.QA_ENGINEER:
        return 'QA Engineer';
      case Position.UIUX_DESIGNER:
        return 'UI/UX Designer';
      case Position.DATA_ANALYST:
        return 'Data Analyst';
      case Position.PRODUCT_MANAGER:
        return 'Product Manager';
      case Position.TECHNICAL_LEAD:
        return 'Technical Lead';
      case Position.SOFTWARE_ARCHITECT:
        return 'Software Architect';
      case Position.BUSINESS_ANALYST:
        return 'Business Analyst';
      case Position.SYSTEM_ADMINISTRATOR:
        return 'System Administrator';
      case Position.DATABASE_ADMINISTRATOR:
        return 'Database Administrator';
      case Position.SECURITY_ENGINEER:
        return 'Security Engineer';
      case Position.MOBILE_APP_DEVELOPER:
        return 'Mobile App Developer';
      default:
        return 'Team Member';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const completionRate = member.assignedTasks > 0 
    ? Math.round((member.completedTasks / member.assignedTasks) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {member.avatar ? (
              <img 
                src={member.avatar} 
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {getInitials(member.name)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              {getPositionIcon(member.position)}
            </div>
            <p className="text-sm text-gray-600">{formatPosition(member.position)}</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="More options"
            aria-label="More options for team member"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button 
                onClick={() => {
                  onEdit(member);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => onDelete(member.id)}
                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{member.email}</span>
        </div>
        {member.department && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{member.department}</span>
          </div>
        )}
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
          <Briefcase className="w-3 h-3 mr-1" />
          {formatRole(member.role)}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{member.assignedTasks}</p>
          <p className="text-xs text-gray-600">Assigned</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">{member.completedTasks}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">{member.overdueTasks}</p>
          <p className="text-xs text-gray-600">Overdue</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Task Completion</span>
          <span className="text-xs text-gray-900 font-medium">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Assigned Projects */}
      {member.assignedProjects.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">Projects ({member.assignedProjects.length})</p>
          <div className="flex flex-wrap gap-1">
            {member.assignedProjects.slice(0, 3).map((project) => (
              <span
                key={project.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: project.color || '#6B7280' }}
              >
                {project.name}
              </span>
            ))}
            {member.assignedProjects.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{member.assignedProjects.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Click overlay to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};
