import React, { useState } from "react";
import {
  Heart,
  Mail,
  Send,
  Check,
  X,
  Sparkles,
  Flame,
  ShieldAlert,
  Clock,
  Activity as ActivityIcon,
  Lock,
  Loader2,
  AlertCircle,
  Link2Off,
  Star,
} from "lucide-react";
import { usePartner } from "../hooks/usePartner";
import { useAuth } from "../hooks/useAuth";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  ProgressBar,
  useToast,
} from "../components/ui";

export const PartnerPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const {
    partnerStatus,
    activities,
    isLoading,
    actionLoading,
    error: hookError,
    invite,
    accept,
    reject,
    disconnect,
  } = usePartner();

  const [inviteEmail, setInviteEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);

  const displayError = localError || hookError;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || actionLoading) return;

    setLocalError(null);
    try {
      await invite(inviteEmail.trim());
      setInviteEmail("");
      toast({
        type: "success",
        title: "Invitation Sent! 💌",
        description: `Partnership invite dispatched to ${inviteEmail}.`,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to send partner invitation.";
      setLocalError(msg);
    }
  };

  const handleAcceptInvite = async () => {
    setLocalError(null);
    try {
      await accept(partnerStatus?.invitation?.id);
      toast({
        type: "success",
        title: "Sanctuary Connected! ❤️",
        description: "You and your partner are now linked in NILEV.",
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to accept partner invitation.";
      setLocalError(msg);
    }
  };

  const handleRejectInvite = async () => {
    setLocalError(null);
    try {
      await reject(partnerStatus?.invitation?.id);
      toast({
        type: "info",
        title: "Invitation Declined",
        description: "The incoming partner invitation has been dismissed.",
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to reject invitation.";
      setLocalError(msg);
    }
  };

  const handleDisconnect = async () => {
    setLocalError(null);
    try {
      await disconnect();
      setIsDisconnectDialogOpen(false);
      toast({
        type: "info",
        title: "Connection Dissolved",
        description: "Your partner connection has been disconnected.",
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to disconnect partner.";
      setLocalError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
          <div className="absolute h-6 w-6 rounded-full bg-violet-500/20 blur-sm" />
        </div>
        <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">
          Loading companion link...
        </p>
      </div>
    );
  }

  const status = partnerStatus?.status || "NO_PARTNER";
  const partner = partnerStatus?.partner;
  const user = partnerStatus?.user;
  const invitation = partnerStatus?.invitation;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Error Alert Banner */}
      {displayError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 backdrop-blur-md animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 font-medium">{displayError}</div>
          <button
            onClick={() => setLocalError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* STATE 1: NO PARTNER */}
      {status === "NO_PARTNER" && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#121633] via-[#0d1124] to-[#070913] p-8 sm:p-10 backdrop-blur-2xl shadow-xl shadow-black/50">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 -mb-10 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              {/* Dual Avatar Motif */}
              <div className="mb-6 flex items-center space-x-4">
                <Avatar
                  fallback={user?.name || currentUser?.name || "You"}
                  size="lg"
                  status="online"
                  partnerRing
                  glow
                />
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                  <Heart className="h-5 w-5 fill-violet-400 text-violet-400 animate-pulse" />
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-violet-500/30 bg-slate-900/60 text-slate-500">
                  <span className="text-xs font-semibold">Partner</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="violet" size="sm" withDot>
                  Private Two-Person Space
                </Badge>
                <span className="text-xs text-slate-400">Strict 1-on-1 Rule</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                Connect Your Partner Sanctuary
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                NILEV is built exclusively for two connected people. Link with your partner
                to view each other&apos;s daily habit completion, streaks, goals progress, XP,
                celestial companion evolution, and shared timeline in real time.
              </p>

              {/* Core Security Rule Callout */}
              <div className="mt-4 rounded-xl border border-violet-500/15 bg-violet-950/20 p-3 text-xs text-violet-300/90 flex items-start gap-2.5">
                <Lock className="h-4 w-4 shrink-0 text-violet-400 mt-0.5" />
                <span>
                  <strong>Privacy &amp; Autonomy:</strong> While you can see your partner&apos;s progress,
                  partner data is strictly read-only. You cannot edit, delete, or alter their habits or companion.
                </span>
              </div>
            </div>
          </div>

          {/* Invitation Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 glass-panel-elevated">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Send className="h-4 w-4 text-violet-400" />
                  Send Partner Invitation
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your partner&apos;s NILEV registered email address to begin your synchronized journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div>
                    <label
                      htmlFor="invite-partner-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                    >
                      Partner Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        id="invite-partner-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="maya@nilev.space"
                        required
                        disabled={actionLoading}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="glow"
                    disabled={actionLoading || !inviteEmail.trim()}
                    leftIcon={
                      actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4 fill-white" />
                      )
                    }
                  >
                    {actionLoading ? "Sending Invitation..." : "Send Partner Invitation"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sidebar Guidelines */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-200">
                  How Connection Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                    1
                  </div>
                  <span>Invite your partner via their account email.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                    2
                  </div>
                  <span>They review and accept the invite from their dashboard.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                    3
                  </div>
                  <span>Your space activates with shared streaks, XP, and companion synergy.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* STATE 2: INVITATION SENT */}
      {status === "INVITATION_SENT" && (
        <Card className="glass-panel-elevated p-8 sm:p-10 text-center max-w-xl mx-auto">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 shadow-xl shadow-violet-950/80 ring-1 ring-white/20">
            <Clock className="h-9 w-9 text-white animate-pulse" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-500 opacity-20 blur-md" />
          </div>

          <Badge variant="violet" size="default" withDot pulseDot className="mb-4">
            Invitation Awaiting Response
          </Badge>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Invitation Pending
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            We sent a partnership request to{" "}
            <span className="font-semibold text-violet-300">
              {invitation?.receiverEmail || "your partner"}
            </span>
            . Once they log in and accept, your two-person sanctuary will automatically synchronize.
          </p>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 max-w-sm mx-auto mb-6 text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1.5">
              <span>Invited On</span>
              <span className="text-slate-200">
                {invitation?.createdAt ? new Date(invitation.createdAt).toLocaleDateString() : "Today"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-amber-400 font-medium">Pending Acceptance</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              leftIcon={<Clock className="h-3.5 w-3.5" />}
            >
              Refresh Status
            </Button>
          </div>
        </Card>
      )}

      {/* STATE 3: INVITATION RECEIVED */}
      {status === "INVITATION_RECEIVED" && (
        <Card className="glass-panel-elevated p-8 sm:p-10 text-center max-w-xl mx-auto border-violet-500/30 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-violet-600 shadow-xl shadow-pink-950/80 ring-1 ring-white/20">
            <Heart className="h-9 w-9 fill-white text-white animate-bounce" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-500 opacity-30 blur-md" />
          </div>

          <Badge variant="rose" size="default" withDot pulseDot className="mb-4">
            Incoming Partnership Request
          </Badge>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {invitation?.senderName || "Someone"} invited you!
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            <span className="font-semibold text-white">{invitation?.senderName}</span> (
            <span className="text-violet-300">{invitation?.senderEmail}</span>) wants to connect
            sanctuaries with you on NILEV.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <Button
              variant="glow"
              className="w-full sm:w-auto"
              disabled={actionLoading}
              onClick={handleAcceptInvite}
              leftIcon={
                actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )
              }
            >
              {actionLoading ? "Connecting..." : "Accept & Connect Sanctuary"}
            </Button>

            <Button
              variant="ghost"
              className="w-full sm:w-auto text-slate-400 hover:text-rose-400"
              disabled={actionLoading}
              onClick={handleRejectInvite}
              leftIcon={<X className="h-4 w-4" />}
            >
              Decline
            </Button>
          </div>
        </Card>
      )}

      {/* STATE 4: CONNECTED */}
      {status === "CONNECTED" && partner && user && (
        <div className="space-y-6">
          {/* SHARED RELATIONSHIP HEADER: YOU ❤️ PARTNER */}
          <div
            id="shared-relationship-header"
            className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-r from-[#17133d] via-[#101533] to-[#151235] p-6 backdrop-blur-2xl shadow-xl shadow-black/50"
          >
            <div className="absolute right-1/4 top-0 -mt-10 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
            <div className="absolute left-1/4 bottom-0 -mb-10 h-64 w-64 rounded-full bg-pink-600/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Central Couple Header */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Your Avatar */}
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user.avatarUrl || user.profileImageUrl || undefined}
                    fallback={user.nickname || user.name || "You"}
                    size="lg"
                    status="online"
                    partnerRing
                    glow
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400">
                      You
                    </span>
                    <h3 className="text-base font-bold text-white truncate max-w-[140px]">
                      {user.nickname || user.name}
                    </h3>
                  </div>
                </div>

                {/* Glowing Shared Heart Link */}
                <div className="flex flex-col items-center justify-center px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-widest text-violet-300 uppercase hidden sm:inline">
                      YOU
                    </span>
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-violet-600 shadow-lg shadow-pink-900/50">
                      <Heart className="h-5 w-5 fill-white text-white animate-pulse" />
                    </div>
                    <span className="text-xs font-black tracking-widest text-violet-300 uppercase hidden sm:inline">
                      PARTNER
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-pink-300 mt-1 flex items-center gap-1">
                    <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {partnerStatus.sharedStreak || 1}-day shared streak
                  </span>
                </div>

                {/* Partner Avatar */}
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={partner.avatarUrl || undefined}
                    fallback={partner.nickname || partner.name || "Partner"}
                    size="lg"
                    status="online"
                    partnerRing
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400">
                      Partner
                    </span>
                    <h3 className="text-base font-bold text-white truncate max-w-[140px]">
                      {partner.nickname || partner.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Status and Disconnect */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <Badge variant="violet" size="sm" withDot pulseDot>
                  2-Person Sanctuary Linked
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDisconnectDialogOpen(true)}
                  className="text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
                  leftIcon={<Link2Off className="h-3.5 w-3.5" />}
                >
                  Dissolve
                </Button>
              </div>
            </div>
          </div>

          {/* DUAL PROFILES: Your Profile + Partner Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* YOUR PROFILE (Active / Full Control) */}
            <Card className="glass-panel-elevated border-violet-500/20">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={user.avatarUrl || user.profileImageUrl || undefined}
                      fallback={user.nickname || user.name || "You"}
                      size="md"
                      status="online"
                      partnerRing
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base text-white">
                          {user.nickname ? `${user.nickname} (${user.name})` : user.name}
                        </CardTitle>
                        <Badge variant="violet" size="sm">
                          You (Owner)
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-slate-400">
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" size="sm">
                    Full Control
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-4">
                {/* Level & XP */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      Level {user.level || 1}
                    </span>
                    <span className="text-slate-400">{user.xp || 150} / 500 XP</span>
                  </div>
                  <ProgressBar value={((user.xp || 150) % 500) / 5} variant="violet" size="sm" />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Streak
                    </span>
                    <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {user.streak || 0}d
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Habits Done
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      {user.habitsCompletedCount || 0}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Goals
                    </span>
                    <span className="text-lg font-black text-violet-400">
                      {user.goalsCount || 0}
                    </span>
                  </div>
                </div>

                {/* Companion Widget */}
                <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-950/20 to-purple-950/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-violet-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Celestial Companion
                      </span>
                    </div>
                    <Badge variant="violet" size="sm">
                      Level {user.companionLevel || 1}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-violet-200">
                        {user.companionName || "Starlight"}
                      </span>
                      <span className="text-slate-400 text-[11px] block">
                        {user.companionType || "CELESTIAL_FOX"}
                      </span>
                    </div>
                    <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-[11px] text-violet-300 font-medium">
                      Mood: {user.companionMood || "Joyful"} ✨
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PARTNER PROFILE (Connected / Read-Only View) */}
            <Card className="glass-panel-elevated border-pink-500/25 shadow-[0_0_30px_rgba(236,72,153,0.08)]">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      fallback={partner.name || "Partner"}
                      size="md"
                      status="online"
                      partnerRing
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base text-white">
                          {partner.name}
                        </CardTitle>
                        <Badge variant="rose" size="sm">
                          Partner
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-slate-400">
                        {partner.email}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Read-Only Badge */}
                  <Badge variant="indigo" size="sm" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Read-Only
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-4">
                {/* Level & XP (Read Only) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      Level {partner.level || 1}
                    </span>
                    <span className="text-slate-400">{partner.xp || 200} / 500 XP</span>
                  </div>
                  <ProgressBar value={((partner.xp || 200) % 500) / 5} variant="indigo" size="sm" />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Streak
                    </span>
                    <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {partner.streak || 0}d
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Habits Done
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      {partner.habitsCompletedCount || 0}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Goals
                    </span>
                    <span className="text-lg font-black text-pink-400">
                      {partner.goalsCount || 0}
                    </span>
                  </div>
                </div>

                {/* Companion Widget (Read Only) */}
                <div className="rounded-xl border border-pink-500/20 bg-gradient-to-r from-pink-950/20 to-purple-950/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Partner Companion
                      </span>
                    </div>
                    <Badge variant="rose" size="sm">
                      Level {partner.companionLevel || 1}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-pink-200">
                        {partner.companionName || "Nebula"}
                      </span>
                      <span className="text-slate-400 text-[11px] block">
                        {partner.companionType || "ASTRAL_OWL"}
                      </span>
                    </div>
                    <span className="rounded-lg bg-pink-500/10 px-2 py-1 text-[11px] text-pink-300 font-medium">
                      Mood: {partner.companionMood || "Joyful"} ✨
                    </span>
                  </div>
                </div>

                {/* Core Rule Enforcement Notice */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-[11px] text-slate-400 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                  <span>
                    <strong>Partner Data is Read-Only:</strong> You cannot edit, complete, or delete
                    partner habits or alter their companion. All progress modifications are securely restricted to
                    the account owner.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card className="glass-panel-elevated">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4 text-violet-400" />
                  Shared Activity Timeline
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Real-time synchronization between you and {partner.name}
                </CardDescription>
              </div>
              <Badge variant="default" size="sm">
                Live Feed
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No activities recorded yet. Complete habits to generate shared milestone events!
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between py-3 transition-colors hover:bg-white/[0.02] px-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/25 text-sm">
                          {act.icon || "✨"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-100 truncate">
                              {act.title}
                            </span>
                            <Badge
                              variant={act.isPartner ? "rose" : "violet"}
                              size="sm"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {act.isPartner ? "Partner" : "You"}
                            </Badge>
                          </div>
                          {act.description && (
                            <p className="text-[11px] text-slate-400 truncate">
                              {act.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-4">
                        {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDisconnectDialogOpen}
        title="Dissolve Partner Connection?"
        message="Are you sure you want to disconnect? Once dissolved, your shared streaks and mutual progression views will end until a new invitation is accepted. Exactly two people can connect."
        confirmText="Dissolve Connection"
        cancelText="Keep Connected"
        isDestructive={true}
        onConfirm={handleDisconnect}
        onClose={() => setIsDisconnectDialogOpen(false)}
      />
    </div>
  );
};

export default PartnerPage;
