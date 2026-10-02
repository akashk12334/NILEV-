import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Camera,
  Trash2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  User as UserIcon,
  HeartHandshake,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { usePartner } from "../hooks/usePartner";
import { userService } from "../services/user.service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { ROUTES } from "../constants";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const { partnerStatus } = usePartner();
  const { toast } = useToast();

  // Profile fields state
  const [name, setName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Profile image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isRemovingImage, setIsRemovingImage] = useState<boolean>(false);

  // Account deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Sync state with current user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || "");
    }
  }, [user]);

  // Clean up preview object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Check if account details form has unsaved changes
  const isDetailsDirty =
    (user && (name.trim() !== (user.name || "") || nickname.trim() !== (user.nickname || ""))) ||
    false;

  // Handle Photo selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        type: "error",
        title: "Unsupported Image Format",
        description: "Please select a JPG, PNG, or WEBP image file.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Image size must be less than 5 MB.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Clean up previous blob
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelPhotoPreview = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;

    setIsUploadingImage(true);
    try {
      await userService.uploadProfilePicture(selectedFile);
      await refreshUser();
      handleCancelPhotoPreview();
      toast({
        type: "success",
        title: "Profile Picture Updated",
        description: "Your new avatar has been saved successfully.",
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to update profile picture. Please try again.";
      toast({
        type: "error",
        title: "Upload Failed",
        description: message,
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.avatarUrl && !user?.profileImageUrl) return;

    setIsRemovingImage(true);
    try {
      await userService.removeProfilePicture();
      await refreshUser();
      handleCancelPhotoPreview();
      toast({
        type: "success",
        title: "Photo Removed",
        description: "Profile picture reset to default avatar.",
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to remove profile picture. Please try again.";
      toast({
        type: "error",
        title: "Removal Failed",
        description: message,
      });
    } finally {
      setIsRemovingImage(false);
    }
  };

  // Handle Account Details Save
  const handleSaveAccountDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        type: "error",
        title: "Validation Error",
        description: "Full name cannot be blank.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateUser({
        name: name.trim(),
        nickname: nickname.trim() || undefined,
      });
      await refreshUser();
      toast({
        type: "success",
        title: "Changes Saved",
        description: "Your profile details have been updated successfully.",
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to update your profile. Please try again.";
      toast({
        type: "error",
        title: "Save Failed",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation.trim() !== "DELETE") {
      toast({
        type: "error",
        title: "Confirmation Required",
        description: "Please type DELETE exactly to confirm account deletion.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await userService.deleteAccount("DELETE");
      toast({
        type: "success",
        title: "Account Permanently Deleted",
        description: "Your personal data and active connection have been removed.",
      });
      setIsDeleteModalOpen(false);
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to delete account. Please try again later.";
      toast({
        type: "error",
        title: "Deletion Failed",
        description: message,
      });
      setIsDeleting(false);
    }
  };

  const isConnected = partnerStatus?.status === "CONNECTED";
  const partner = partnerStatus?.partner;
  const currentAvatarSrc =
    previewUrl || user?.avatarUrl || user?.profileImageUrl || undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── HEADER HERO ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#161233]/90 via-[#0e1328]/85 to-[#0b0f20]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Account Settings
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Manage your profile picture, couple display identity, and security preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="violet" size="sm" withDot pulseDot className="py-1 px-3">
                <HeartHandshake className="h-3.5 w-3.5 mr-1 text-pink-400" />
                Linked with {partner?.nickname || partner?.name || "Partner"}
              </Badge>
            ) : (
              <Badge variant="default" size="sm" className="py-1 px-3 text-slate-400 border-slate-700/60">
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                Solo Space Mode
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── 1. PROFILE PICTURE CARD ──────────────────────────────────── */}
      <Card className="glass-panel-elevated border-violet-500/20 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-violet-400" />
                Profile Picture
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Customize the avatar shown across your partner space, habits, and community interactions.
              </CardDescription>
            </div>
            {previewUrl && (
              <Badge variant="amber" size="sm" className="animate-pulse">
                Unsaved Preview
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <Avatar
                src={currentAvatarSrc}
                fallback={nickname || name || "You"}
                size="2xl"
                status="online"
                glow
                partnerRing={isConnected}
                className="border-2 border-violet-400/40 shadow-xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium transition-all duration-200 cursor-pointer backdrop-blur-[2px]"
                title="Change Photo"
              >
                <Camera className="h-5 w-5 mb-1" />
                <span>Upload</span>
              </button>
            </div>

            {/* Controls & Requirements */}
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Avatar Photo
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Upload a clean JPG, PNG, or WEBP photo (max 5 MB). It will automatically render as your circular couple icon.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Buttons Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {previewUrl ? (
                  <>
                    <Button
                      variant="glow"
                      size="sm"
                      isLoading={isUploadingImage}
                      onClick={handleSavePhoto}
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    >
                      {isUploadingImage ? "Uploading..." : "Save Photo"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isUploadingImage}
                      onClick={handleCancelPhotoPreview}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Camera className="h-4 w-4" />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    {(user?.avatarUrl || user?.profileImageUrl) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={isRemovingImage}
                        leftIcon={<Trash2 className="h-4 w-4 text-rose-400" />}
                        className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                        onClick={handleRemovePhoto}
                      >
                        {isRemovingImage ? "Removing..." : "Remove Photo"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. ACCOUNT DETAILS CARD ─────────────────────────────────── */}
      <Card className="glass-panel-elevated border-violet-500/20 shadow-xl overflow-hidden">
        <form onSubmit={handleSaveAccountDetails}>
          <CardHeader className="border-b border-slate-800/80 pb-5">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-violet-400" />
              Account Details
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Update your full legal name and your custom couple space nickname.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="settings-full-name" className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                id="settings-full-name"
                type="text"
                placeholder="e.g. Akash Rivera"
                value={name}
                maxLength={100}
                required
                onChange={(e) => setName(e.target.value)}
                className="bg-[#0b0e1e]/80 border-slate-700/60 focus:border-violet-500"
              />
              <p className="text-[11px] text-slate-500">
                Your primary account name used for account identification and billing.
              </p>
            </div>

            {/* Nickname */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-nickname" className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  Nickname
                  <Sparkles className="h-3 w-3 text-violet-400" />
                </label>
                <span className="text-[10px] text-violet-400/80 font-medium">
                  Primary Display Name
                </span>
              </div>
              <Input
                id="settings-nickname"
                type="text"
                placeholder="e.g. ShadowFox, Lumi, Starlight"
                value={nickname}
                maxLength={50}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-[#0b0e1e]/80 border-slate-700/60 focus:border-violet-500"
              />
              <p className="text-[11px] text-slate-500">
                When provided, your nickname will be displayed across dashboard greetings, partner feed, habit completion alerts, and companion achievements.
              </p>
            </div>

            {/* Email (Read-Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-email" className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  Email
                  <Lock className="h-3 w-3 text-slate-400" />
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Read-only 🔒
                </span>
              </div>
              <div className="relative">
                <Input
                  id="settings-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  readOnly
                  className="bg-[#080b18]/60 border-slate-800 text-slate-400 cursor-not-allowed pr-10 select-none"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500">
                Email address is locked to your account security credentials and cannot be edited directly.
              </p>
            </div>
          </CardContent>

          <CardFooter className="border-t border-slate-800/80 pt-4 pb-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isDetailsDirty ? "Unsaved changes detected" : "All changes saved"}
            </span>
            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={isSaving}
              disabled={!isDetailsDirty || isSaving}
              className="px-5 font-semibold"
            >
              {isSaving ? "Saving changes..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ── 3. DANGER ZONE ───────────────────────────────────────────── */}
      <Card className="border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-[#0d1020]/90 to-rose-950/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-rose-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-rose-300 font-bold tracking-tight">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-xs text-rose-300/70">
                Irreversible account actions with permanent data implications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                Delete Account
              </h4>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Permanently delete your NILEV account and associated personal data (habits, goals, companion, memories). If linked with a partner, your connection will be dissolved safely without deleting their account.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setDeleteConfirmation("");
                setIsDeleteModalOpen(true);
              }}
              className="w-full sm:w-auto shrink-0 font-semibold"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── DELETE ACCOUNT CONFIRMATION MODAL ───────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeleteConfirmation("");
          }
        }}
        size="md"
        title={
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete your account?</span>
          </div>
        }
        description="This action cannot be undone. The account and associated personal data will be permanently deleted."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmation("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              disabled={deleteConfirmation.trim() !== "DELETE" || isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? "Deleting account..." : "Delete Account"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-1">
          {/* Partner Safety Alert */}
          {isConnected && (
            <div className="rounded-xl border border-pink-500/25 bg-pink-950/20 p-3 text-xs text-pink-200/90 leading-relaxed">
              <span className="font-bold text-pink-300">Partner Connection Safety: </span>
              Your partner ({partner?.nickname || partner?.name || "Partner"}) will see an appropriate &quot;Partner disconnected&quot; state. Their account, habits, and private data will <strong>not</strong> be affected or deleted.
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="delete-confirm-input" className="text-xs text-slate-300 font-medium">
              Type <strong className="text-white font-mono bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">DELETE</strong> to confirm:
            </label>
            <Input
              id="delete-confirm-input"
              type="text"
              autoFocus
              placeholder="DELETE"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="bg-[#0b0e1e] border-rose-500/40 text-rose-200 placeholder:text-slate-600 focus:border-rose-400 focus:ring-rose-500/30 font-mono"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
