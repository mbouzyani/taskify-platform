import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '../types';
import { teamApi } from '../services/api';

export const useTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeTaskStats, setIncludeTaskStats] = useState(false);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teamApi.getTeamMembers(includeTaskStats);
      
      if (response.success) {
        // Handle both arrays and empty responses
        setTeamMembers(Array.isArray(response.data) ? response.data : []);
      } else {
        // Don't treat empty results as an error
        setTeamMembers([]);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      // Only set error for actual network/server errors
      if (err instanceof Error && err.message !== 'Failed to fetch') {
        setError(err.message);
      } else {
        setError('Unable to connect to server. Please check if the backend is running.');
      }
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  }, [includeTaskStats]);

  useEffect(() => {
    fetchTeamMembers();
  }, [includeTaskStats, fetchTeamMembers]);

  const refetch = () => {
    fetchTeamMembers();
  };

  const toggleTaskStats = () => {
    setIncludeTaskStats(prev => !prev);
  };

  return {
    teamMembers,
    loading,
    error,
    includeTaskStats,
    refetch,
    toggleTaskStats
  };
};
