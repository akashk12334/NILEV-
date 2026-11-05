import React, { useState } from "react";
import { KeyRound, Copy, Check, Download, ShieldAlert } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface RecoveryCodeModalProps {
  isOpen: boolean;
  recoveryCode: string;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const RecoveryCodeModal: React.FC<RecoveryCodeModalProps> = ({
  isOpen,
  recoveryCode,
  onClose,
  title = "Your Account Recovery Code",
  subtitle = "Save this code now. It provides instant access to reset your password without email delivery and will not be displayed again.",
}) => {
  const [copied, setCopied] = useState(false);
  const [hasConfirmedSaved, setHasConfirmedSaved] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement("textarea");
      textarea.value = recoveryCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString();
    const content = `========================================================
NILEV SANCTUARY - ACCOUNT RECOVERY CODE
========================================================

Your One-Time Recovery Code:
${recoveryCode}

Generated On:
${timestamp}

SECURITY & USAGE INSTRUCTIONS:
1. This recovery code allows you to regain access to your NILEV
   sanctuary even if you cannot access or receive emails.
2. Store this file in a secure password manager or encrypted drive.
3. This code is SINGLE-USE. Once used to reset your password, you
   should generate a fresh recovery code from Settings.
4. Never share this code with anyone. NILEV will never ask for it.
========================================================
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nilev-recovery-code-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    if (!hasConfirmedSaved) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // Only allow close if user checked the confirmation
        if (hasConfirmedSaved) {
          onClose();
        }
      }}
      title={title}
      size="md"
    >
      <div className="space-y-5">
        {/* Header Icon & Subtitle */}
        <div className="flex items-start gap-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Code Display Box */}
        <div className="relative rounded-2xl border border-violet-500/30 bg-gradient-to-b from-[#13172e] to-[#0c0f20] p-5 text-center shadow-[0_0_25px_rgba(124,58,237,0.15)]">
          <div className="flex items-center justify-center gap-2 mb-2 text-violet-400">
            <KeyRound className="h-4 w-4" />
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              One-Time Recovery Code
            </span>
          </div>

          <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-white selection:bg-violet-600 selection:text-white py-2">
            {recoveryCode}
          </div>

          <p className="text-[11px] text-slate-400 mt-1">
            Case-insensitive • Format includes 4-character blocks
          </p>
        </div>

        {/* Action Buttons: Copy & Download */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600/15 hover:bg-violet-600/25 px-4 py-2.5 text-xs font-semibold text-violet-300 transition"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-violet-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 transition"
          >
            <Download className="h-4 w-4 text-slate-300" />
            <span>Download .txt</span>
          </button>
        </div>

        {/* Mandatory Confirmation Checkbox */}
        <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#070913]/60 p-3.5 cursor-pointer hover:border-slate-700 transition">
          <input
            type="checkbox"
            checked={hasConfirmedSaved}
            onChange={(e) => setHasConfirmedSaved(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500/40"
          />
          <span className="text-xs text-slate-300 leading-relaxed select-none">
            I confirm that I have securely stored this recovery code in a password manager or safe offline file. I understand it will not be displayed again.
          </span>
        </label>

        {/* Footer Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleComplete}
            disabled={!hasConfirmedSaved}
            className="w-full"
            variant="default"
          >
            I&apos;ve Safely Saved My Code
          </Button>
        </div>
      </div>
    </Modal>
  );
};
