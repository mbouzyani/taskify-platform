import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Users, FolderOpen } from 'lucide-react';
import { UpdateTaskCommand, TaskPriority, TaskStatus, Project, TeamMember, Task } from '../../types';
import { PagedResult } from '../../services/api/baseApi';
import { projectsApi, teamApi } from '../../services/api';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: UpdateTaskCommand) => Promise<void>;
  task: Task;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  task,
}) => {
  const [formData, setFormData] = useState<Partial<UpdateTaskCommand>>({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    projectId: task.projectId,
    assigneeId: task.assigneeId || '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        projectId: task.projectId,
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
      loadData();
    }
  }, [isOpen, task]);

  const loadData = async () => {
    try {
      const [projectsResponse, membersResponse] = await Promise.all([
        projectsApi.getProjects(),
        teamApi.getTeamMembers(),
      ]);

      if (projectsResponse.success) {
        // Handle both array response and paginated response
        const projectsData = Array.isArray(projectsResponse.data) 
          ? projectsResponse.data 
          : (projectsResponse.data as PagedResult<Project>)?.items || [];
        setProjects(projectsData);
      }
      if (membersResponse.success) {
        // Handle both array response and paginated response
        const membersData = Array.isArray(membersResponse.data) 
          ? membersResponse.data 
          : (membersResponse.data as PagedResult<TeamMember>)?.items || [];
        setTeamMembers(membersData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Task description is required';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Project selection is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const updateCommand: UpdateTaskCommand = {
        id: formData.id!,
        title: formData.title!,
        description: formData.description!,
        priority: formData.priority!,
        status: formData.status!,
        projectId: formData.projectId!,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate || undefined,
      };

      await onUpdate(updateCommand);
      onClose();
      
      // Reset form
      setFormData({
        id: '',
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        projectId: 0,
        assigneeId: '',
        dueDate: ''
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'text-green-600 bg-green-100';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      case TaskPriority.HIGH:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'text-gray-600 bg-gray-100';
      case TaskStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-100';
      case TaskStatus.REVIEW:
        return 'text-purple-600 bg-purple-100';
      case TaskStatus.COMPLETED:
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close modal"
            aria-label="Close edit task modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Project and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Project *
              </label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => handleChange('projectId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.projectId ? 'border-red-500' : 'border-gray-300'
                }`}
                title="Select project for task"
                aria-label="Select project for task"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status || TaskStatus.TODO}
                onChange={(e) => handleChange('status', parseInt(e.target.value) as TaskStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select task status"
                aria-label="Select task status"
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Review</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>
            </div>
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority || TaskPriority.MEDIUM}
                onChange={(e) => handleChange('priority', parseInt(e.target.value) as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select task priority"
                aria-label="Select task priority"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Assignee
              </label>
              <select
                value={formData.assigneeId || ''}
                onChange={(e) => handleChange('assigneeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select task assignee"
                aria-label="Select task assignee"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select due date"
              aria-label="Select task due date"
            />
          </div>

          {/* Current Values Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Current Values:</h4>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority || TaskPriority.MEDIUM)}`}>
                {formData.priority === TaskPriority.LOW ? 'Low' :
                 formData.priority === TaskPriority.MEDIUM ? 'Medium' : 'High'} Priority
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.status || TaskStatus.TODO)}`}>
                {formData.status === TaskStatus.TODO ? 'To Do' :
                 formData.status === TaskStatus.IN_PROGRESS ? 'In Progress' :
                 formData.status === TaskStatus.REVIEW ? 'Review' : 'Completed'}
              </span>
              {formData.assigneeId && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Assigned to {teamMembers.find(m => m.id === formData.assigneeId)?.name || 'Unknown'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
