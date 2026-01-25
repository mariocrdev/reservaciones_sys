import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import {RefreshCw} from "lucide-react"

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();

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

  return session
    ? (console.log("Tienes acceso desde protected routes"), children)
    : (console.log("No Tienes acceso desde protected routes"),
      (<Navigate to="/auth" replace />));
};

export default ProtectedRoute;
