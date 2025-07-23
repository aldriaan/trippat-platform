'use client';

import React from 'react';
import AdminLayout from '@/components/shared/AdminLayout';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  headerActions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  showSearch = false,
  headerActions,
}) => {
  return (
    <AdminLayout
      title={title || 'Admin Dashboard'}
      subtitle={subtitle}
      showSearch={showSearch}
      headerActions={headerActions}
    >
      {children}
    </AdminLayout>
  );
};

export default Layout;