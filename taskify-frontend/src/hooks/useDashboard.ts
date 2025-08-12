import { useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { dashboardApi, OverviewStats, RecentActivity } from '../services/api';

export const useDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, overviewResponse, activityResponse] = await Promise.all([
        dashboardApi.getDashboardStats(),
        dashboardApi.getOverviewStats(),
        dashboardApi.getRecentActivity(10)
      ]);
      
      if (statsResponse.success) {
        setDashboardStats(statsResponse.data);
      }
      
      if (overviewResponse.success) {
        setOverviewStats(overviewResponse.data);
      }
      
      if (activityResponse.success) {
        setRecentActivity(activityResponse.data);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { 
    dashboardStats,
    overviewStats, 
    recentActivity,
    loading, 
    error,
    refetch: fetchDashboardData
  };
};
