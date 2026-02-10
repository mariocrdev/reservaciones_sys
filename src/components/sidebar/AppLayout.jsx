import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { ProfileCompletionModal } from "@/components/profile/ProfileCompletionModal";

const AppLayout = () => {
  return (
    <AppSidebar>
      <ProfileCompletionModal />
      <Outlet />
    </AppSidebar>
  );
};

export default AppLayout;
