import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { ROUTES } from "../constants";

export const AuthLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#070913] text-slate-100 px-4 py-12 overflow-hidden selection:bg-violet-500/30 selection:text-white">
      {/* Cosmic background radial gradients and glow effects */}
      <div className="pointer-events-none absolute inset-0 cosmic-bg-mesh opacity-80" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-violet-600/15 via-indigo-500/10 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-fuchsia-600/10 via-violet-600/10 to-transparent blur-3xl rounded-full" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* NILEV Logo Header */}
        <Link
          to={ROUTES.HOME}
          className="group mb-8 flex flex-col items-center text-center transition-transform hover:scale-[1.02] duration-300"
        >
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 shadow-xl shadow-violet-950/80 ring-1 ring-white/25 group-hover:shadow-violet-600/40 transition-all duration-300">
            <Heart className="h-7 w-7 fill-white text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-500 to-pink-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-white font-sans">
              NILEV
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Sparkles className="h-3 w-3 text-violet-400" />
              Sanctuary
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400 font-medium tracking-wide">
            Private two-person companion tracking platform
          </p>
        </Link>

        {/* Centered Authentication Card with soft glow and glassmorphism */}
        <div className="w-full rounded-2xl border border-violet-500/20 bg-[#0c1022]/90 p-7 sm:p-9 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(139,92,246,0.18)] transition-all">
          <Outlet />
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-[11px] text-slate-500">
          <span>End-to-End Encrypted & Private Companion Space</span>
        </div>
      </div>
    </div>
  );
};
