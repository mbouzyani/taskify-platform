import React, { useState } from 'react';
import { Calendar, Flag, MoreVertical, Trash2, Edit, FolderOpen } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  viewMode?: 'list' | 'grid';
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  compact = false, 
  viewMode = 'list', 
  onClick, 
  onDelete,
  onEdit 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.URGENT: return 'text-red-600 bg-red-100';
      case TaskPriority.HIGH: return 'text-orange-600 bg-orange-100';
      case TaskPriority.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case TaskPriority.LOW: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-gray-100 text-gray-700';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TaskStatus.REVIEW: return 'bg-purple-100 text-purple-700';
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityText = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.LOW: return 'Low';
      case TaskPriority.MEDIUM: return 'Medium';
      case TaskPriority.HIGH: return 'High';
      case TaskPriority.URGENT: return 'Urgent';
      default: return 'Unknown';
    }
  };

  const getStatusText = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.REVIEW: return 'Review';
      case TaskStatus.COMPLETED: return 'Completed';
      default: return 'Unknown';
    }
  };

  const getProgressPercentage = (status: TaskStatus): number => {
    switch (status) {
      case TaskStatus.TODO: return 0;
      case TaskStatus.IN_PROGRESS: return 50;
      case TaskStatus.REVIEW: return 80;
      case TaskStatus.COMPLETED: return 100;
      default: return 0;
    }
  };

  const getProgressColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-gray-300';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-500';
      case TaskStatus.REVIEW: return 'bg-purple-500';
      case TaskStatus.COMPLETED: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer relative group ${
        compact ? 'p-3 hover:bg-gray-50' : 'p-4 md:p-6 hover:border-gray-300'
      } ${viewMode === 'grid' ? 'h-full flex flex-col' : ''}`}
      onClick={onClick}
    >
      {/* Priority Indicator Bar */}
      <div 
        className={`absolute top-0 left-0 w-full h-1 rounded-t-lg ${
          task.priority === TaskPriority.URGENT ? 'bg-red-500' :
          task.priority === TaskPriority.HIGH ? 'bg-orange-500' :
          task.priority === TaskPriority.MEDIUM ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      ></div>

      {/* Project Color Side Bar */}
      <div 
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: task.projectColor || '#6B7280' }}
      ></div>

      <div className="flex items-start justify-between mb-3">
        <div className={`flex-1 ml-2 ${viewMode === 'grid' ? 'min-h-0' : ''}`}>
          <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
            compact ? 'text-sm' : 'text-base md:text-lg'
          }`}>
            {task.title}
          </h3>
          {!compact && task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{task.description}</p>
          )}
        </div>
        
        {/* Menu Button */}
        <div className="relative ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleMenuClick}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              {onEdit && (
                <button
                  onClick={handleEditClick}
                  className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-t-lg flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className={`w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 ${onEdit ? 'rounded-b-lg border-t border-gray-100' : 'rounded-lg'}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="flex items-center mb-3 ml-2">
        <FolderOpen className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
        <span className="text-xs text-gray-600 truncate">{task.projectName}</span>
      </div>

      {/* Status and Priority */}
      <div className="flex flex-wrap items-center gap-2 mb-3 ml-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
          {getStatusText(task.status)}
        </span>
        
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          <Flag className="w-3 h-3 mr-1" />
          {getPriorityText(task.priority)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 ml-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 font-medium">Progress</span>
          <span className="text-xs text-gray-600 font-medium">{getProgressPercentage(task.status)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(task.status)}`}
            style={{ width: `${getProgressPercentage(task.status)}%` }}
          ></div>
        </div>
      </div>

      {/* Footer Info - Flex grow to push to bottom in grid view */}
      <div className={`ml-2 ${viewMode === 'grid' ? 'mt-auto' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {task.dueDate && (
              <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">Due </span>
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>

          {task.assigneeName && (
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-1 flex-shrink-0">
                {task.assigneeName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <span className="hidden md:inline truncate max-w-20">{task.assigneeName}</span>
            </div>
          )}
        </div>

        {isOverdue && (
          <div className="mt-2 text-xs text-red-600 font-medium flex items-center">
            <span className="animate-pulse">⚠️</span>
            <span className="ml-1">Overdue</span>
          </div>
        )}

        {/* Created date for additional context */}
        <div className="flex items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
          <Calendar className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Created </span>
          <span>{new Date(task.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: viewMode === 'grid' ? undefined : 'numeric'
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