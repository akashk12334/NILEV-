import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWakeupNotice, setShowWakeupNotice] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowWakeupNotice(true);
      }, 7000);
    } else {
      setShowWakeupNotice(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070913] text-slate-300 px-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
          <div className="absolute h-6 w-6 rounded-full bg-violet-500/20 blur-sm" />
        </div>
        <p className="mt-4 text-xs font-medium text-slate-400 tracking-wider uppercase">
          Securing NILEV session...
        </p>

        {showWakeupNotice && (
          <div className="mt-6 max-w-sm text-center">
            <p className="text-xs text-amber-400/90 mb-3 leading-relaxed">
              The server is waking up from idle sleep. This may take up to 25 seconds.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate(ROUTES.LOGIN);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/30 transition"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};
