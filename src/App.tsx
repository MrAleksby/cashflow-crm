import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ClientsPage from './pages/ClientsPage';
import ClientFormPage from './pages/ClientFormPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ClassesPage from './pages/ClassesPage';
import CampaignsPage from './pages/CampaignsPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Защищенный маршрут
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Публичный маршрут (только для неавторизованных)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <ClientsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/new" element={
        <ProtectedRoute>
          <ClientFormPage />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/:id" element={
        <ProtectedRoute>
          <ClientDetailPage />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/:id/edit" element={
        <ProtectedRoute>
          <ClientFormPage />
        </ProtectedRoute>
      } />
      
      <Route path="/classes" element={
        <ProtectedRoute>
          <ClassesPage />
        </ProtectedRoute>
      } />
      
      <Route path="/campaigns" element={
        <ProtectedRoute>
          <CampaignsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
