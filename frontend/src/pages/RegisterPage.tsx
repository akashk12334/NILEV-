import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { ROUTES } from "../constants";
import { useAuth } from "../hooks/useAuth";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);

    // Basic client-side validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      const resp = (err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            error?: string;
            errors?: Record<string, string>;
          };
        };
      })?.response;
      let msg = resp?.data?.message || resp?.data?.error;

      // Handle validation field errors map if returned by backend
      if (!msg && resp?.data?.errors) {
        const errorList = Object.values(resp.data.errors);
        if (errorList.length > 0) {
          msg = errorList.join(", ");
        }
      }

      if (!msg) {
        if (resp?.status === 409) {
          msg = "An account with this email address already exists.";
        } else if (resp?.status === 400) {
          msg = "Please verify that your registration details are valid.";
        } else {
          msg = "Unable to complete registration. Please try again.";
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
          Create Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Begin your journey with your partner on NILEV
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

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label
            htmlFor="register-name"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              id="register-name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="register-email"
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
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {/* Show / Hide Password Button */}
            <button
              type="button"
              id="toggle-register-password-visibility"
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
          <p className="mt-1.5 text-[11px] text-slate-500">
            Must contain at least 6 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="register-submit-btn"
          disabled={isLoading}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login Link */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link
          to={ROUTES.LOGIN}
          id="link-to-login"
          className="font-semibold text-violet-400 hover:text-violet-300 transition-colors underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
