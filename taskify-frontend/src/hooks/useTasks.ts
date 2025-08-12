import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../types';
import { tasksApi, TaskFiltersDto } from '../services/api';

export const useTasks = (initialFilters?: TaskFiltersDto) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFiltersDto>(initialFilters || {});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use ref to track if we're currently fetching to prevent multiple simultaneous requests
  const isFetchingRef = useRef(false);

  const fetchTasks = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const filtersWithPagination = {
        ...filters,
        page: currentPage,
        pageSize: filters.pageSize || 20
      };
      
      const response = await tasksApi.getTasks(filtersWithPagination);
      
      if (response.success) {
        setTasks(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [filters, currentPage]);

  // Effect to fetch tasks when filters, page, or refresh trigger changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  const updateFilters = useCallback((newFilters: Partial<TaskFiltersDto>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    tasks,
    loading,
    error,
    filters,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    updateFilters,
    clearFilters,
    refetch
  };
};