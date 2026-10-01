import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Sparkles, Target, Flame, Shield, ArrowRight } from "lucide-react";
import { ROUTES } from "../constants";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 text-center w-full px-4 sm:px-6">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
          <div className="h-[400px] w-[600px] bg-gradient-to-tr from-indigo-600 to-pink-600 blur-[130px] rounded-full" />
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Architecture &amp; Foundation Initialized</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Grow Together with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              NILEV
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            A private, two-person habit, goal, activity, and companion tracking
            platform designed exclusively for couples to nurture their bond.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="flex items-center space-x-2">
                <span>Start Together</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <Flame className="h-8 w-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">Habit Streaks</h3>
            <p className="mt-2 text-sm text-slate-400">
              Build daily rhythms individually and as a couple with joint streak counters.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <Target className="h-8 w-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">Shared Goals</h3>
            <p className="mt-2 text-sm text-slate-400">
              Set milestones, track savings, and celebrate mutual achievements.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <Sparkles className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">Virtual Companion</h3>
            <p className="mt-2 text-sm text-slate-400">
              An evolving couple companion avatar that thrives on your mutual consistency.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <Shield className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">Completely Private</h3>
            <p className="mt-2 text-sm text-slate-400">
              Zero public feeds. End-to-end dedicated space strictly between two partners.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
