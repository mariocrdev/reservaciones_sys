import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = () => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
