import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { ROUTES } from "../constants";
import { authService } from "../services/auth.service";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || isLoading) return;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email: trimmedEmail });
      setIsSubmitted(true);
    } catch (err: unknown) {
      const resp = (err as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
      })?.response;

      if (resp?.status === 429) {
        setError("Too many requests. Please wait a minute before requesting another reset link.");
      } else {
        // Generic response on error to avoid account enumeration
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!isSubmitted ? (
        <>
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Forgot Password?
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-[320px] mx-auto leading-relaxed">
              Enter your registered email and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Registered Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="forgot-email"
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

            <button
              type="submit"
              id="forgot-submit-btn"
              disabled={isLoading || !email.trim()}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs">
            <Link
              to={ROUTES.LOGIN}
              id="link-back-to-login"
              className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </>
      ) : (
        /* Generic Success State (Prevents Account Enumeration) */
        <div className="text-center py-2 animate-in fade-in duration-300">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Check Your Email
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-[340px] mx-auto mb-4">
            If an account is associated with <span className="font-semibold text-violet-300">{email}</span>, you will receive a secure password reset link shortly.
          </p>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 mb-6 text-[11px] text-slate-400 text-left space-y-1">
            <p className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span>⏱️</span> Link expires in 15 minutes
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Didn&apos;t receive anything? Check your spam or junk folder, or verify the email address entered.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              to={ROUTES.LOGIN}
              id="btn-return-login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              Try another email
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;

