import React from 'react';
import { MoreVertical, Users, Calendar, BarChart3, CheckCircle, Trash2 } from 'lucide-react';
import { Project, ProjectStatus } from '../../types';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: number) => void;
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case ProjectStatus.ON_HOLD:
      return 'bg-yellow-100 text-yellow-800';
    case ProjectStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800';
    case ProjectStatus.ARCHIVED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return 'Active';
    case ProjectStatus.ON_HOLD:
      return 'On Hold';
    case ProjectStatus.COMPLETED:
      return 'Completed';
    case ProjectStatus.ARCHIVED:
      return 'Archived';
    default:
      return 'Unknown';
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const progressPercentage = project.taskCount > 0 ? project.completionPercentage : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Project Header with Color Bar */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: project.color }}
      ></div>
      
      <div className="p-4 md:p-6 h-full flex flex-col">
        {/* Header with Menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{project.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>
          </div>
          
          <div className="relative ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Project options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onDelete(project.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: project.color
              }}
            ></div>
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{project.taskCount}</p>
            <p className="text-xs text-gray-600">Tasks</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{project.completedTasks}</p>
            <p className="text-xs text-gray-600">Done</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{project.totalMembers}</p>
            <p className="text-xs text-gray-600">Members</p>
          </div>
        </div>

        {/* Assigned Members - Responsive */}
        {project.assignedMembers && project.assignedMembers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Team</p>
            <div className="flex -space-x-2">
              {project.assignedMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                  title={member.name}
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>
              ))}
              {project.assignedMembers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{project.assignedMembers.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer - Push to bottom */}
        <div className="flex items-center text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
          <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="hidden sm:inline">Created </span>
          <span>{new Date(project.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Click overlay for closing menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
};