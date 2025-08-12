import React, { useState, useEffect } from 'react';
import { Grid, List, Plus, Search, Calendar, Users, BarChart3 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, CreateTaskCommand, UpdateTaskCommand } from '../../types';
import { TaskList } from './TaskList';
import { TaskFilters as TaskFiltersComponent } from './TaskFilters';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useTasks } from '../../hooks/useTasks';
import { tasksApi, TaskFiltersDto } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export const TasksView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null
  });
  const { showToast } = useToast();

  // Use the new useTasks hook
  const { 
    tasks, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    clearFilters, 
    refetch 
  } = useTasks();

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchQuery || undefined });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, updateFilters]);

  const handleCreateTask = async (taskData: CreateTaskCommand) => {
    try {
      const response = await tasksApi.createTask(taskData);
      if (response.success) {
        setIsCreateModalOpen(false);
        showToast('success', 'Task created successfully!');
        refetch(); // Refresh the tasks list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      showToast('error', 'Failed to create task', 'Please try again.');
      throw error;
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (taskData: UpdateTaskCommand) => {
    try {
      const response = await tasksApi.updateTask(taskData.id, taskData);
      if (response.success) {
        setIsEditModalOpen(false);
        setEditingTask(null);
        showToast('success', 'Task updated successfully!');
        refetch(); // Refresh the tasks list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      showToast('error', 'Failed to update task', 'Please try again.');
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setDeleteConfirm({ isOpen: true, taskId });
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirm.taskId) return;

    try {
      const response = await tasksApi.deleteTask(deleteConfirm.taskId);
      if (response.success) {
        showToast('success', 'Task deleted successfully!');
        if (selectedTask?.id === deleteConfirm.taskId) {
          setSelectedTask(null);
        }
        refetch(); // Refresh the tasks list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      showToast('error', 'Failed to delete task', 'Please try again.');
    } finally {
      setDeleteConfirm({ isOpen: false, taskId: null });
    }
  };

  const handleUpdateFilters = (newFilters: Partial<TaskFiltersDto>) => {
    console.log('Updating filters:', newFilters);
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchQuery('');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.REVIEW:
        return 'Review';
      case TaskStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Low';
      case TaskPriority.MEDIUM:
        return 'Medium';
      case TaskPriority.HIGH:
        return 'High';
      case TaskPriority.URGENT:
        return 'Urgent';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 text-red-400 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Tasks</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and track your project tasks</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Total Tasks</p>
                <p className="text-lg font-semibold text-gray-900">{totalTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">To Do</p>
                <p className="text-lg font-semibold text-gray-900">{todoTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">In Progress</p>
                <p className="text-lg font-semibold text-gray-900">{inProgressTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Completed</p>
                <p className="text-lg font-semibold text-gray-900">{completedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Task Filters */}
        <TaskFiltersComponent
          filters={filters}
          onFiltersChange={handleUpdateFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Tasks List/Grid */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || Object.keys(filters).length > 0 ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first task to get started.'
            }
          </p>
          {!searchQuery && Object.keys(filters).length === 0 && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Task
            </button>
          )}
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          loading={false}
          onTaskClick={handleTaskClick}
          onTaskDelete={handleDeleteTask}
          onTaskEdit={handleEditTask}
          viewMode={viewMode}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close task details"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedTask.title}</h4>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {getStatusText(selectedTask.status)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Priority:</span>
                    <p className="text-sm text-gray-900 mt-1">{getPriorityText(selectedTask.priority)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Project:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedTask.projectName}</p>
                  </div>
                  {selectedTask.assigneeName && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Assignee:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedTask.assigneeName}</p>
                    </div>
                  )}
                  {selectedTask.dueDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Due Date:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(selectedTask.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Created:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedTask.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          onUpdate={handleUpdateTask}
          task={editingTask}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};