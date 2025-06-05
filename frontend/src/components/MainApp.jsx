import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from './auth/AuthPage';
import Dashboard from './dashboard/Dashboard';
import Loading from './common/Loading';

const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return user ? <Dashboard /> : <AuthPage />;
};

export default MainApp;
