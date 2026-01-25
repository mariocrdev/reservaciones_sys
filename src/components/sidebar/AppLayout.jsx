import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';

const AppLayout = () => {
  return (
    <AppSidebar>
      <Outlet />
    </AppSidebar>
  );
};

export default AppLayout;