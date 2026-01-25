import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import {RefreshCw} from "lucide-react"

const AdminRoute = ({ children }) => {
  // AdminRoute para validar si el usuario tiene role admin y que pueda entrar al adminDashboard
  const { isAdmin, loading } = useAuth();

  console.log(isAdmin)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;