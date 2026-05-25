import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import AppLayout from './pages/AppLayout';
import PublicNotePage from './pages/PublicNotePage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-[var(--orange)] text-2xl font-bold">Kairo</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-[var(--orange)] text-2xl font-bold">Kairo</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/reset-password" element={<AuthPage />} />
      <Route path="/note/:shareId" element={<PublicNotePage />} />
      <Route 
        path="/app/*" 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export default App;
