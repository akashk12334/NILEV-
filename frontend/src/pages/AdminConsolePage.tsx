import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Check,
  AlertCircle,
  Timer,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { authService } from "../services/auth.service";
import type {
  AdminApprovalRequest,
  AdminPasswordResetResponse,
  AdminRejectionRequest,
} from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";

type FilterTab = "ALL" | "PENDING" | "COMPLETED" | "REJECTED" | "EXPIRED";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getRemainingTime(expiresAt?: string | null, status?: string): { text: string; isExpired: boolean } {
  if (status && status !== "PENDING") {
    return { text: "Processed", isExpired: false };
  }
  if (!expiresAt) return { text: "Unknown", isExpired: false };

  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return { text: "Expired", isExpired: true };

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (totalHours > 0) {
    return { text: `${totalHours}h ${totalMinutes}m remaining`, isExpired: false };
  }
  return { text: `${totalMinutes}m remaining`, isExpired: false };
}

export const AdminConsolePage: React.FC = () => {
  const { toast } = useToast();

  const [requests, setRequests] = useState<AdminPasswordResetResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("PENDING");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Approval modal state
  const [approvingRequest, setApprovingRequest] = useState<AdminPasswordResetResponse | null>(null);
  const [confirmedIdentity, setConfirmedIdentity] = useState<boolean>(false);
  const [verificationNote, setVerificationNote] = useState<string>("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);

  // Rejection modal state
  const [rejectingRequest, setRejectingRequest] = useState<AdminPasswordResetResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [isSubmittingRejection, setIsSubmittingRejection] = useState<boolean>(false);

  // Fetch all requests from backend
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.getAllAdminPasswordResets();
      setRequests(data || []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load password reset requests. Please verify your administrative credentials.";
      setError(message);
      toast({
        title: "Failed to load requests",
        description: message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Derived counts for overview stats
  const stats = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let rejected = 0;
    let expired = 0;

    for (const r of requests) {
      const isPastExpiry = new Date(r.expiresAt).getTime() <= Date.now();
      if (r.status === "PENDING") {
        if (isPastExpiry) {
          expired++;
        } else {
          pending++;
        }
      } else if (r.status === "COMPLETED") {
        completed++;
      } else if (r.status === "REJECTED") {
        rejected++;
      } else if (r.status === "EXPIRED") {
        expired++;
      }
    }

    return { pending, completed, rejected, expired, total: requests.length };
  }, [requests]);

  // Filtered requests based on active tab & search
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const isPastExpiry = new Date(r.expiresAt).getTime() <= Date.now();
      const effectiveStatus = r.status === "PENDING" && isPastExpiry ? "EXPIRED" : r.status;

      // Filter by tab
      if (activeTab === "PENDING" && effectiveStatus !== "PENDING") return false;
      if (activeTab === "COMPLETED" && effectiveStatus !== "COMPLETED") return false;
      if (activeTab === "REJECTED" && effectiveStatus !== "REJECTED") return false;
      if (activeTab === "EXPIRED" && effectiveStatus !== "EXPIRED") return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesEmail = r.userEmail.toLowerCase().includes(query);
        const matchesName = r.userName?.toLowerCase().includes(query);
        const matchesId = String(r.id).includes(query);
        if (!matchesEmail && !matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [requests, activeTab, searchQuery]);

  // Open approval modal
  const handleOpenApproveModal = (req: AdminPasswordResetResponse) => {
    setApprovingRequest(req);
    setConfirmedIdentity(false);
    setVerificationNote("");
  };

  // Submit approval
  const handleApproveSubmit = async () => {
    if (!approvingRequest) return;
    if (!confirmedIdentity) {
      toast({
        title: "Identity Confirmation Required",
        description: "You must check the confirmation that the user's identity was verified.",
        type: "error",
      });
      return;
    }
    if (!verificationNote.trim()) {
      toast({
        title: "Verification Note Required",
        description: "Please specify the verification method (e.g. phone call, out-of-band contact).",
        type: "error",
      });
      return;
    }

    setIsSubmittingApproval(true);
    try {
      const payload: AdminApprovalRequest = {
        confirmedIdentity: true,
        verificationNote: verificationNote.trim(),
      };
      const message = await authService.approveAdminPasswordReset(approvingRequest.id, payload);
      toast({
        title: "Password Reset Approved",
        description: message || `User ${approvingRequest.userEmail} can now log in with their submitted password.`,
        type: "success",
      });
      setApprovingRequest(null);
      await fetchRequests();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to approve password reset.";
      toast({
        title: "Approval Failed",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Open rejection modal
  const handleOpenRejectModal = (req: AdminPasswordResetResponse) => {
    setRejectingRequest(req);
    setRejectionReason("");
  };

  // Submit rejection
  const handleRejectSubmit = async () => {
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please enter a reason for rejecting this password recovery request.",
        type: "error",
      });
      return;
    }

    setIsSubmittingRejection(true);
    try {
      const payload: AdminRejectionRequest = {
        reason: rejectionReason.trim(),
      };
      const message = await authService.rejectAdminPasswordReset(rejectingRequest.id, payload);
      toast({
        title: "Request Rejected",
        description: message || `Password reset request #${rejectingRequest.id} has been rejected.`,
        type: "info",
      });
      setRejectingRequest(null);
      await fetchRequests();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reject password reset.";
      toast({
        title: "Rejection Failed",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[rgba(147,130,255,0.12)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 shadow-md shadow-violet-950/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Admin Console
            </h1>
            <Badge variant="rose" size="sm" className="hidden sm:inline-flex font-mono">
              Admin Authority
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Supervise platform security, verify account ownership, and authorize password recovery requests.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-violet-400" : ""}`} />}
        >
          {isLoading ? "Refreshing..." : "Refresh Requests"}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading && requests.length === 0 ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Pending Requests"
              value={stats.pending}
              subtitle="Awaiting manual verification"
              accentColor="amber"
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              title="Approved & Reset"
              value={stats.completed}
              subtitle="Successfully authorized"
              accentColor="emerald"
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatCard
              title="Rejected Requests"
              value={stats.rejected}
              subtitle="Denied by administrator"
              accentColor="pink"
              icon={<XCircle className="h-4 w-4" />}
            />
            <StatCard
              title="Expired Requests"
              value={stats.expired}
              subtitle="Exceeded 24h window"
              accentColor="indigo"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      {/* Main Password Reset Requests Section */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(147,130,255,0.08)] pb-4">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-400" />
              Password Reset Requests
            </CardTitle>
            <CardDescription>
              Review submitted recovery requests. Plaintext passwords and hashes are never exposed.
            </CardDescription>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {(
              [
                { key: "PENDING", label: "Pending", count: stats.pending },
                { key: "ALL", label: "All", count: stats.total },
                { key: "COMPLETED", label: "Completed", count: stats.completed },
                { key: "REJECTED", label: "Rejected", count: stats.rejected },
                { key: "EXPIRED", label: "Expired", count: stats.expired },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-violet-600/25 text-violet-200 border border-violet-500/40 shadow-sm"
                    : "bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === tab.key
                      ? "bg-violet-500/30 text-violet-200"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
              <h4 className="text-sm font-semibold text-rose-200">Unable to load requests</h4>
              <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchRequests}>
                Retry Loading
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredRequests.length === 0 && (
            <EmptyState
              icon={<ShieldCheck className="h-8 w-8 text-violet-400" />}
              title={
                searchQuery
                  ? "No matching requests found"
                  : activeTab === "PENDING"
                  ? "No pending password reset requests"
                  : "No requests found for this filter"
              }
              description={
                searchQuery
                  ? `No requests matched "${searchQuery}". Clear your search or try another query.`
                  : activeTab === "PENDING"
                  ? "All password reset requests have been verified and processed. New recovery requests will appear here."
                  : "There are currently no password reset requests matching this status."
              }
              action={
                searchQuery ? (
                  <Button size="sm" variant="secondary" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={fetchRequests}>
                    Check Again
                  </Button>
                )
              }
            />
          )}

          {/* Requests List */}
          {!isLoading && !error && filteredRequests.length > 0 && (
            <div className="space-y-3 pt-1">
              {filteredRequests.map((req) => {
                const validity = getRemainingTime(req.expiresAt, req.status);
                const isPending = req.status === "PENDING" && !validity.isExpired;

                return (
                  <div
                    key={req.id}
                    className="group relative flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 rounded-2xl border border-[rgba(147,130,255,0.1)] bg-[rgba(15,20,38,0.55)] hover:border-[rgba(168,85,247,0.3)] hover:bg-[rgba(18,24,46,0.7)] transition-all duration-200 gap-4"
                  >
                    {/* Left details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/20 text-violet-300 font-mono text-xs font-bold">
                        #{req.id}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">
                            {req.userEmail}
                          </span>
                          {req.userName && (
                            <span className="text-xs text-slate-400">
                              ({req.userName})
                            </span>
                          )}

                          {/* Status Badge */}
                          {req.status === "PENDING" && !validity.isExpired && (
                            <Badge variant="amber" size="sm" withDot pulseDot>
                              Pending Approval
                            </Badge>
                          )}
                          {req.status === "COMPLETED" && (
                            <Badge variant="emerald" size="sm">
                              Completed
                            </Badge>
                          )}
                          {req.status === "REJECTED" && (
                            <Badge variant="rose" size="sm">
                              Rejected
                            </Badge>
                          )}
                          {(req.status === "EXPIRED" || (req.status === "PENDING" && validity.isExpired)) && (
                            <Badge variant="secondary" size="sm">
                              Expired
                            </Badge>
                          )}
                          {req.status === "SUPERSEDED" && (
                            <Badge variant="outline" size="sm">
                              Superseded
                            </Badge>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                          <span>
                            Created: <span className="text-slate-300">{formatDate(req.createdAt)}</span>
                          </span>
                          <span>
                            Expires: <span className="text-slate-300">{formatDate(req.expiresAt)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3 text-slate-400" />
                            <span
                              className={
                                validity.isExpired
                                  ? "text-rose-400 font-medium"
                                  : isPending
                                  ? "text-amber-400 font-medium"
                                  : "text-slate-400"
                              }
                            >
                              {validity.text}
                            </span>
                          </span>
                        </div>

                        {/* Admin audit notes if processed */}
                        {req.adminNotes && (
                          <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                            <span className="text-violet-400 font-medium">Audit note:</span> {req.adminNotes}
                            {req.processedAt && (
                              <span className="text-slate-500 ml-2">
                                (Processed {formatDate(req.processedAt)})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right action buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            variant="glow"
                            onClick={() => handleOpenApproveModal(req)}
                            leftIcon={<Check className="h-3.5 w-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOpenRejectModal(req)}
                            leftIcon={<XCircle className="h-3.5 w-3.5" />}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium px-2 py-1">
                          Processed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Confirmation Modal */}
      <Modal
        isOpen={Boolean(approvingRequest)}
        onClose={() => !isSubmittingApproval && setApprovingRequest(null)}
        title="Approve Password Reset"
        description="Verify identity and authorize password recovery for this account."
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setApprovingRequest(null)}
              disabled={isSubmittingApproval}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={handleApproveSubmit}
              isLoading={isSubmittingApproval}
              disabled={!confirmedIdentity || !verificationNote.trim()}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Approve Password Reset
            </Button>
          </div>
        }
      >
        {approvingRequest && (
          <div className="space-y-4 py-1">
            {/* Target Account Summary */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Request ID:</span>
                <span className="font-mono text-violet-300 font-semibold">#{approvingRequest.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target User Email:</span>
                <span className="text-white font-medium">{approvingRequest.userEmail}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Submitted:</span>
                <span className="text-slate-300">{formatDate(approvingRequest.createdAt)}</span>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/25 bg-amber-950/20 text-amber-300 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <p>
                Approving this request will immediately activate the new password chosen by the applicant.
                You must verify that the applicant is the legitimate owner of this account.
              </p>
            </div>

            {/* Identity Verification Checkbox */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedIdentity}
                  onChange={(e) => setConfirmedIdentity(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-200 font-medium leading-relaxed">
                  I explicitly confirm that I have verified the account owner's real-world identity through a trusted out-of-band communication channel.
                </span>
              </label>
            </div>

            {/* Verification Note Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Identity Verification Method & Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="e.g., Verified identity via direct voice phone call on 2026-11-05..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              />
              <p className="text-[10px] text-slate-400">
                Describe how you verified the requester. This note will be recorded in the security audit log.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Confirmation Modal */}
      <Modal
        isOpen={Boolean(rejectingRequest)}
        onClose={() => !isSubmittingRejection && setRejectingRequest(null)}
        title="Reject Password Reset Request"
        description="Rejecting will invalidate this request without modifying the user's password."
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRejectingRequest(null)}
              disabled={isSubmittingRejection}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRejectSubmit}
              isLoading={isSubmittingRejection}
              disabled={!rejectionReason.trim()}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Reject Request
            </Button>
          </div>
        }
      >
        {rejectingRequest && (
          <div className="space-y-4 py-1">
            <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Request ID:</span>
                <span className="font-mono text-rose-300 font-semibold">#{rejectingRequest.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target User Email:</span>
                <span className="text-white font-medium">{rejectingRequest.userEmail}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Rejection Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Requester failed identity verification / Request unverified..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
              <p className="text-[10px] text-slate-400">
                This reason will be attached to the audit record. The user's active password remains unchanged.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
