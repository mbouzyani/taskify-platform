import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Login } from '../components/Auth/Login';
import { ToastProvider } from '../contexts/ToastContext';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already authenticated, redirect to dashboard or intended page
    if (authService.isAuthenticated()) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleLoginSuccess = async () => {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  return (
    <ToastProvider>
      <Login onSuccess={handleLoginSuccess} />
    </ToastProvider>
  );
};
