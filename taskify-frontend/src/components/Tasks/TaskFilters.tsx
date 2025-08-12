import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority } from '../../types';
import { useProjects } from '../../hooks/useProjects';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: Partial<TaskFiltersType>) => void;
  onClearFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { projects } = useProjects();
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed by default

  const statusOptions = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.REVIEW, label: 'Review' },
    { value: TaskStatus.COMPLETED, label: 'Completed' }
  ];

  const priorityOptions = [
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.URGENT, label: 'Urgent' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count += filters.status.length;
    if (filters.priority && filters.priority.length > 0) count += filters.priority.length;
    if (filters.projectId) count += 1;
    return count;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-900 hover:text-gray-700 transition-colors duration-200"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium">Filters</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                {getActiveFiltersCount()} active
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={() => {
                console.log('Clearing all filters');
                onClearFilters();
              }}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200"
            >
              <X className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                <div className="space-y-2">
                  {statusOptions.map(option => (
                    <label key={option.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(option.value) || false}
                        onChange={(e) => {
                          console.log('Status filter changed:', option.value, e.target.checked);
                          const currentStatus = filters.status || [];
                          let newStatus: TaskStatus[];
                          
                          if (e.target.checked) {
                            newStatus = [...currentStatus, option.value];
                          } else {
                            newStatus = currentStatus.filter(s => s !== option.value);
                          }
                          
                          console.log('New status array:', newStatus);
                          onFiltersChange({ status: newStatus.length > 0 ? newStatus : undefined });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Priority</label>
                <div className="space-y-2">
                  {priorityOptions.map(option => (
                    <label key={option.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.priority?.includes(option.value) || false}
                        onChange={(e) => {
                          console.log('Priority filter changed:', option.value, e.target.checked);
                          const currentPriority = filters.priority || [];
                          let newPriority: TaskPriority[];
                          
                          if (e.target.checked) {
                            newPriority = [...currentPriority, option.value];
                          } else {
                            newPriority = currentPriority.filter(p => p !== option.value);
                          }
                          
                          console.log('New priority array:', newPriority);
                          onFiltersChange({ priority: newPriority.length > 0 ? newPriority : undefined });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Project</label>
                <select
                  value={filters.projectId?.toString() || ''}
                  onChange={(e) => {
                    const newProjectId = e.target.value ? parseInt(e.target.value) : undefined;
                    console.log('Project filter changed:', newProjectId);
                    onFiltersChange({ projectId: newProjectId });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200"
                  title="Filter by project"
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};