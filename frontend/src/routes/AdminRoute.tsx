import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../constants";
import { useAuth } from "../hooks/useAuth";

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070913] text-slate-300 px-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
          <div className="absolute h-6 w-6 rounded-full bg-violet-500/20 blur-sm" />
        </div>
        <p className="mt-4 text-xs font-medium text-slate-400 tracking-wider uppercase">
          Verifying administrator authority...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Non-admin users cannot access /admin by typing URL directly
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

