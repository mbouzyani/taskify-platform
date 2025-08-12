import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, FolderOpen, Home, Users, Building2, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: BarChart3, path: '/tasks' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
    { id: 'team', label: 'Team', icon: Users, path: '/team' },
    { id: 'department', label: 'Department', icon: Building2, path: '#', disabled: true },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 h-full shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Taskify</h1>
        </div>
      </div>
      
      <nav className="px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isDevelopment = item.disabled;
            
            if (isDevelopment) {
              return (
                <li key={item.id}>
                  <div className="relative group">
                    <div
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 text-gray-500 cursor-not-allowed opacity-75"
                      title="Department features under development"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                        Department features under development
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            }
            
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
          
          {/* Settings Button with extra spacing */}
          <li className="pt-4">
            <div className="relative group">
              <div
                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 text-gray-500 cursor-not-allowed opacity-75"
                title="Settings features under development"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </div>
              
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  Settings features under development
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};