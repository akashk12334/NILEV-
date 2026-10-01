import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { ROUTES } from "../constants";
import { useAuth } from "../hooks/useAuth";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Where to redirect after login
  const fromLocation =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    ROUTES.DASHBOARD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);

    try {
      await login({
        email: email.trim(),
        password,
        rememberMe,
      });
      navigate(fromLocation, { replace: true });
    } catch (err: unknown) {
      const resp = (err as { response?: { status?: number; data?: { message?: string; error?: string } } })?.response;
      let msg = resp?.data?.message || resp?.data?.error;

      if (!msg) {
        if (resp?.status === 401) {
          msg = "Invalid email or password. Please verify your credentials.";
        } else if (resp?.status === 403) {
          msg = "Your account is currently deactivated. Please contact support.";
        } else {
          msg = "Unable to connect to server. Please try again.";
        }
      }
      setError(msg);
    }
  };

  return (
    <div className="w-full">
      {/* Card Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Welcome Back
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign in to your private companion sanctuary
        </p>
      </div>

      {/* Error Alert State */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{error}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="login-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@nilev.space"
              required
              autoComplete="email"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {/* Show / Hide Password Button */}
            <button
              type="button"
              id="toggle-password-visibility"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              tabIndex={0}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900/80 text-violet-600 focus:ring-violet-500/40 focus:ring-offset-0 focus:ring-2 transition cursor-pointer accent-violet-600"
            />
            <span className="text-xs font-medium text-slate-300">
              Remember me
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="login-submit-btn"
          disabled={isLoading}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register Link */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Don&apos;t have an account yet?{" "}
        <Link
          to={ROUTES.REGISTER}
          id="link-to-register"
          className="font-semibold text-violet-400 hover:text-violet-300 transition-colors underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
