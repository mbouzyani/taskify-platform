import { useState, useEffect } from 'react';
import { Project } from '../types';
import { projectsApi, ProjectFiltersDto } from '../services/api';

export const useProjects = (initialFilters?: ProjectFiltersDto) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFiltersDto>(initialFilters || {});
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 useProjects: Fetching projects with filters:', filters);
      
      const response = await projectsApi.getProjects(filters);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('[OK] useProjects: Successfully loaded projects:', response.data);
        setProjects(response.data);
        setTotalCount(response.data.length);
        setTotalPages(1); // Since we're not using pagination
      } else {
        console.error('[ERROR] useProjects: Failed to fetch projects:', response);
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('[ERROR] useProjects: Exception fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = (newFilters: Partial<ProjectFiltersDto>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const refetch = () => {
    fetchProjects();
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return {
    projects,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch
  };
};