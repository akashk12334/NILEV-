import * as React from "react";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center space-x-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isDestructive
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                : "bg-violet-500/15 text-violet-400 border border-violet-500/30"
            }`}
          >
            {isDestructive ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <HelpCircle className="h-4 w-4" />
            )}
          </div>
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
    </Modal>
  );
};
