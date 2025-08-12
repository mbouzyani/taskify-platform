import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Project, ProjectStatus, CreateProjectCommand } from '../../types';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { EditProjectModal } from './EditProjectModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { projectsApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useProjects } from '../../hooks/useProjects';

export const ProjectsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; projectId: number | null }>({
    isOpen: false,
    projectId: null
  });
  const { showSuccess, showError } = useToast();

  const {
    projects = [],
    loading,
    error,
    refetch
  } = useProjects({
    pageSize: 20,
    search: searchTerm,
    status: statusFilter !== 'all' ? [statusFilter as ProjectStatus] : undefined
  });

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ProjectStatus | 'all');
  };

  const handleCreateProject = async (projectData: CreateProjectCommand) => {
    try {
      const response = await projectsApi.createProject(projectData);
      if (response.success) {
        showSuccess('Success', 'Project created successfully');
        setIsCreateModalOpen(false);
        refetch(); // Refresh the projects list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      showError('Error', errorMessage);
    }
  };

  const handleDeleteProject = (projectId: number) => {
    setDeleteConfirm({ isOpen: true, projectId });
  };

  const confirmDeleteProject = async () => {
    if (!deleteConfirm.projectId) return;

    try {
      const response = await projectsApi.deleteProject(deleteConfirm.projectId);
      if (response.success) {
        showSuccess('Success', 'Project deleted successfully');
        refetch(); // Refresh the projects list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      showError('Error', errorMessage);
    } finally {
      setDeleteConfirm({ isOpen: false, projectId: null });
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (projectData: CreateProjectCommand) => {
    if (!selectedProject) return;

    const updateData = {
      id: selectedProject.id,
      ...projectData
    };

    try {
      const response = await projectsApi.updateProject(selectedProject.id, updateData);
      if (response.success) {
        showSuccess('Success', 'Project updated successfully');
        setIsEditModalOpen(false);
        setSelectedProject(null);
        refetch(); // Refresh the projects list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      showError('Error', errorMessage);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <h2 className="text-lg font-semibold">Error loading projects</h2>
        <p>{error}</p>
      </div>
    );
  }

  const filteredProjects = (projects || []).filter((project: Project) => {
    if (!project) return false;
    
    const matchesSearch = searchTerm.toLowerCase() === '' || 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2 border rounded-lg"
            aria-label="Filter projects by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Project Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Delete project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{project.description}</p>
                
                {/* Status Badge */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === ProjectStatus.ACTIVE 
                    ? 'bg-green-100 text-green-800' 
                    : project.status === ProjectStatus.COMPLETED 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status === ProjectStatus.ACTIVE ? 'Active' :
                   project.status === ProjectStatus.COMPLETED ? 'Completed' :
                   'On Hold'}
                </span>
              </div>

              {/* Project Stats */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{project.taskCount || 0}</div>
                    <div className="text-xs text-gray-500">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{project.completedTasks || 0}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {project.taskCount > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.completionPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Task Breakdown */}
                {project.taskCount > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">{project.todoTasks || 0}</div>
                      <div className="text-gray-500">To Do</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{project.inProgressTasks || 0}</div>
                      <div className="text-gray-500">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">{project.reviewTasks || 0}</div>
                      <div className="text-gray-500">Review</div>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {project.assignedMembers && project.assignedMembers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Team</h4>
                      <span className="text-xs text-gray-500">{project.totalMembers || project.assignedMembers.length} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {project.assignedMembers.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="relative group"
                          title={member.name}
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      {project.assignedMembers.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            +{project.assignedMembers.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No team members assigned */}
                {(!project.assignedMembers || project.assignedMembers.length === 0) && (
                  <div className="text-center py-2">
                    <div className="text-gray-400 text-sm">No team members assigned</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => handleViewDetails(project)}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleEditProject(project)}
                    className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Edit Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {projects.length === 0 ? "No projects yet" : "No projects match your search"}
            </h3>
            <p className="text-gray-500 mb-6">
              {projects.length === 0
                ? "Get started by creating your first project and organizing your tasks efficiently!"
                : "Try adjusting your search terms or filter criteria to find what you're looking for"}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Project
              </button>
            )}
            {projects.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />
      )}

      {isDetailModalOpen && selectedProject && (
        <ProjectDetailsModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}

      {isEditModalOpen && selectedProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
          }}
          onUpdate={handleUpdateProject}
          project={selectedProject}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, projectId: null })}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and will remove all associated tasks and data."
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
