import * as React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../utils/cn";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
  info: <Info className="h-4 w-4 text-violet-400 shrink-0" />,
};

const toastBorderGlow: Record<ToastType, string> = {
  success: "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  error: "border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
  warning: "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  info: "border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ type = "info", title, description, durationMs = 4000 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, description, durationMs };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismiss(id);
        }, durationMs);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start justify-between rounded-xl border bg-[rgba(10,14,28,0.92)] p-4 backdrop-blur-xl shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-200",
              toastBorderGlow[item.type]
            )}
          >
            <div className="flex items-start space-x-3">
              <span className="mt-0.5">{toastIcons[item.type]}</span>
              <div>
                <h5 className="text-xs font-semibold text-white">{item.title}</h5>
                {item.description && (
                  <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismiss(item.id)}
              className="ml-3 text-slate-500 hover:text-white transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
