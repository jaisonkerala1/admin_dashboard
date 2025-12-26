import { ReactNode, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop: always open via CSS (lg:translate-x-0), Mobile: controlled by state */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};

