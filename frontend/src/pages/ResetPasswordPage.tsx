import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { ROUTES } from "../constants";
import { authService } from "../services/auth.service";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password validation indicators
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!token) {
      setError("Reset token is missing. Please request a new password reset link.");
      return;
    }

    if (!hasMinLength) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword({
        token: token.trim(),
        newPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const resp = (err as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string; errorCode?: string };
        };
      })?.response;

      let msg = resp?.data?.message || resp?.data?.error;

      if (!msg) {
        if (resp?.status === 401 || resp?.data?.errorCode === "TOKEN_EXPIRED") {
          msg = "This password reset link has expired. Please request a new one.";
        } else if (resp?.data?.errorCode === "INVALID_TOKEN") {
          msg = "This password reset token is invalid or has already been used.";
        } else {
          msg = "Unable to reset password. Please try again or request a new link.";
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Missing or empty token state
  if (!token) {
    return (
      <div className="w-full text-center py-2 animate-in fade-in duration-300">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-950/40">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          Invalid Reset Link
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed max-w-[340px] mx-auto mb-6">
          The password reset link is missing a valid token or has been corrupted. Please request a fresh reset link.
        </p>

        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Request New Reset Link</span>
        </Link>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="w-full text-center py-2 animate-in fade-in duration-300">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          Password Reset Complete!
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed max-w-[340px] mx-auto mb-6">
          Your password has been successfully updated and secured. You may now sign in with your new credentials.
        </p>

        <Link
          to={ROUTES.LOGIN}
          id="btn-login-after-reset"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 transition-all"
        >
          <span>Sign In to Sanctuary</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Reset Your Password
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-[320px] mx-auto leading-relaxed">
          Create a new password for your NILEV companion account.
        </p>
      </div>

      {/* Error Alert State */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 backdrop-blur-sm animate-in fade-in slide-from-top-1 duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">
            {error}
            {(error.includes("expired") || error.includes("invalid") || error.includes("used")) && (
              <div className="mt-2">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="inline-flex items-center gap-1 font-semibold text-violet-300 hover:text-white underline underline-offset-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Request a new link</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label
            htmlFor="reset-new-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="reset-new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              onClick={() => setShowNewPassword((prev) => !prev)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="reset-confirm-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Requirements Checklist */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                hasMinLength ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-slate-600"
              }`}
            />
            <span className={hasMinLength ? "text-emerald-300 font-medium" : "text-slate-400"}>
              At least 6 characters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                passwordsMatch ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-slate-600"
              }`}
            />
            <span className={passwordsMatch ? "text-emerald-300 font-medium" : "text-slate-400"}>
              Passwords match
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="reset-submit-btn"
          disabled={isLoading || !hasMinLength || !passwordsMatch}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Save New Password</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Back to Sign In */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs">
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-slate-400 hover:text-white transition-colors"
        >
          Cancel and return to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

