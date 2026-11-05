import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { ROUTES } from "../constants";
import { authService } from "../services/auth.service";

type ResetMode = "recovery-code" | "email";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ResetMode>("recovery-code");

  // Email reset state
  const [email, setEmail] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

  // Recovery code reset state
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Email Reset Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || isLoading) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email: trimmedEmail });
      setIsEmailSubmitted(true);
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
        setIsEmailSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Recovery Code Reset Submit
  const handleRecoveryCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = recoveryEmail.trim();
    const trimmedCode = recoveryCode.trim();

    if (!trimmedEmail || !trimmedCode || isLoading) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPasswordWithRecoveryCode({
        email: trimmedEmail,
        recoveryCode: trimmedCode,
        newPassword,
      });
      setIsResetSuccess(true);
    } catch (err: unknown) {
      const resp = (err as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
      })?.response;

      if (resp?.status === 429) {
        setError("Too many attempts. Please wait a minute before trying again.");
      } else {
        setError("Invalid email or recovery code. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* 1. Recovery Code Reset Success */}
      {isResetSuccess ? (
        <div className="text-center py-2 animate-in fade-in duration-300">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Password Reset Successful!
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-[340px] mx-auto mb-6">
            Your sanctuary password has been successfully updated. You can now sign in using your new credentials.
          </p>

          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 transition-all"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : isEmailSubmitted ? (
        /* 2. Email Reset Success (Generic State) */
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
              Didn&apos;t receive anything? Check your spam folder or use your account <strong>Recovery Code</strong> instead.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setIsEmailSubmitted(false);
                setMode("recovery-code");
                setError(null);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 py-2 px-4 text-xs font-semibold text-violet-300 transition-all"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Use Recovery Code Instead</span>
            </button>

            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 w-full"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        /* 3. Main Recovery Forms (Tabbed) */
        <>
          {/* Header */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Password Recovery
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-[320px] mx-auto leading-relaxed">
              Recover access to your sanctuary using your backup recovery code or registered email.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("recovery-code");
                setError(null);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                mode === "recovery-code"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Recovery Code
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("email");
                setError(null);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                mode === "email"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Email Link
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* TAB 1: Recovery Code Form */}
          {mode === "recovery-code" ? (
            <form onSubmit={handleRecoveryCodeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="alex@nilev.space"
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Recovery Code
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder="NLV-XXXX-XXXX-XXXX-XXXX"
                    required
                    disabled={isLoading}
                    className="w-full font-mono rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 uppercase tracking-wider disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-10 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !recoveryEmail.trim() || !recoveryCode.trim() || !newPassword}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-600/30 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Verifying & Resetting...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Reset Password</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: Email Reset Form */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@nilev.space"
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
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
          )}

          {/* Back to Login */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
