import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants";
import { Button } from "../components/ui/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-indigo-500">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-white">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-400">
        The destination you are looking for does not exist in this couple space.
      </p>
      <div className="mt-6">
        <Link to={ROUTES.HOME}>
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  );
};
