import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { TaskList } from '../Tasks/TaskList';
import { CreateTaskModal } from '../Tasks/CreateTaskModal';
import { ProgressRing } from './ProgressRing';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { DonutChart } from './DonutChart';
import { Task, TaskStatus, TaskPriority, DashboardStats, CreateTaskCommand } from '../../types';
import { dashboardApi, tasksApi } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats and tasks
        const [statsResponse, tasksResponse] = await Promise.all([
          dashboardApi.getDashboardStats(),
          tasksApi.getTasks({ pageSize: 10 }) // Get recent tasks for display
        ]);

        if (statsResponse.success && tasksResponse.success) {
          setStats(statsResponse.data);
          setTasks(tasksResponse.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle task creation
  const handleCreateTask = async (taskData: CreateTaskCommand) => {
    try {
      const response = await tasksApi.createTask(taskData);
      if (response.success) {
        showToast('success', 'Task Created', 'New task has been created successfully!');
        setShowCreateTaskModal(false);
        
        // Refresh dashboard data to show the new task
        const [statsResponse, tasksResponse] = await Promise.all([
          dashboardApi.getDashboardStats(),
          tasksApi.getTasks({ pageSize: 10 })
        ]);

        if (statsResponse.success && tasksResponse.success) {
          setStats(statsResponse.data);
          setTasks(tasksResponse.data.items);
        }
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to create task. Please try again.');
      console.error('Error creating task:', error);
    }
  };

  // Prepare chart data
  const getStatusChartData = () => {
    if (!tasks.length) return [];
    
    const todoCount = tasks.filter(t => t.status === TaskStatus.TODO).length;
    const inProgressCount = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const reviewCount = tasks.filter(t => t.status === TaskStatus.REVIEW).length;
    const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    
    return [
      { label: 'To Do', value: todoCount, color: '#6B7280' },
      { label: 'In Progress', value: inProgressCount, color: '#3B82F6' },
      { label: 'Review', value: reviewCount, color: '#8B5CF6' },
      { label: 'Completed', value: completedCount, color: '#10B981' }
    ];
  };

  const getPriorityChartData = () => {
    if (!tasks.length) return [];
    
    const lowCount = tasks.filter(t => t.priority === TaskPriority.LOW).length;
    const mediumCount = tasks.filter(t => t.priority === TaskPriority.MEDIUM).length;
    const highCount = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
    const urgentCount = tasks.filter(t => t.priority === TaskPriority.URGENT).length;
    
    return [
      { label: 'Low', value: lowCount, color: 'bg-green-500' },
      { label: 'Medium', value: mediumCount, color: 'bg-yellow-500' },
      { label: 'High', value: highCount, color: 'bg-orange-500' },
      { label: 'Urgent', value: urgentCount, color: 'bg-red-500' }
    ];
  };

  const getWeeklyTrendData = () => {
    // Generate last 7 days data
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count tasks completed on this day
      const completedThisDay = tasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate.toDateString() === date.toDateString();
      }).length;
      
      days.push({ label: dayName, value: completedThisDay });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-xl h-64"></div>
            <div className="bg-gray-200 rounded-xl h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening with your tasks.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Tasks"
            value={stats.totalTasks}
            change="+3 from last week"
            changeType="positive"
            icon={Target}
            color="bg-blue-500"
          />
          <StatsCard
            title="Completed"
            value={stats.completedTasks}
            change={`${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate`}
            changeType="positive"
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressTasks}
            change="Active this week"
            changeType="neutral"
            icon={Clock}
            color="bg-amber-500"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdueTasks}
            change="Needs attention"
            changeType="negative"
            icon={AlertCircle}
            color="bg-red-500"
          />
          <StatsCard
            title="This Week"
            value={stats.tasksCompletedThisWeek}
            change="Tasks completed"
            changeType="positive"
            icon={TrendingUp}
            color="bg-purple-500"
          />
          <StatsCard
            title="Productivity"
            value={`${stats.productivityScore}%`}
            change="Above average"
            changeType="positive"
            icon={Users}
            color="bg-indigo-500"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Progress Ring - Overall Completion */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <div className="flex justify-center">
            <ProgressRing
              progress={stats?.productivityScore || 0}
              size={160}
              color="#10B981"
              label="Completion Rate"
            />
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <DonutChart
            title="Task Status Distribution"
            data={getStatusChartData()}
            size={180}
            innerRadius={50}
          />
        </div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Priority Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <BarChart
            title="Tasks by Priority"
            data={getPriorityChartData()}
            height={200}
            showValues={true}
          />
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <LineChart
            title="Weekly Completion Trend"
            data={getWeeklyTrendData()}
            height={200}
            color="#3B82F6"
            showDots={true}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
          <TaskList tasks={tasks.slice(0, 5)} loading={loading} compact />
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowCreateTaskModal(true)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Create New Task</div>
                  <div className="text-sm text-gray-600">Add a new task to your workflow</div>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                // Navigate to tasks page with overdue filter
                showToast('info', 'Feature Coming Soon', 'Overdue tasks review will be available soon.');
              }}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-orange-300 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Review Overdue Tasks</div>
                  <div className="text-sm text-gray-600">{stats?.overdueTasks || 0} tasks need attention</div>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                showToast('info', 'Feature Coming Soon', 'Weekly reports will be available in the next update.');
              }}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-green-300 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Weekly Report</div>
                  <div className="text-sm text-gray-600">Generate productivity insights</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onCreate={handleCreateTask}
      />
    </div>
  );
};