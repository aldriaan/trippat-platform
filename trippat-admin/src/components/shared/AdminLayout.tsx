'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  headerActions?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  showSearch = false,
  headerActions,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title={title || 'Admin Dashboard'}
        subtitle={subtitle}
        showSearch={showSearch}
        actions={headerActions}
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminLayout;