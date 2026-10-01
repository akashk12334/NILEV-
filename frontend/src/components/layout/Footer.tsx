import React from "react";
import { Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4">
        <div className="flex items-center space-x-1">
          <span>NILEV &copy; {new Date().getFullYear()} &bull; Built with</span>
          <Heart className="h-3 w-3 text-pink-500 fill-pink-500 inline mx-0.5" />
          <span>for couples</span>
        </div>
        <div className="mt-2 sm:mt-0 text-slate-600">
          Private two-person companion tracking
        </div>
      </div>
    </footer>
  );
};
