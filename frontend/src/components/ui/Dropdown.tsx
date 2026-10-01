import * as React from "react";
import { cn } from "../../utils/cn";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: (DropdownItem | { divider: true })[];
  align?: "left" | "right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-xl border border-[rgba(147,130,255,0.18)] bg-[rgba(12,16,32,0.95)] p-1.5 backdrop-blur-xl shadow-2xl shadow-black/80 ring-1 ring-white/5 animate-in fade-in-0 zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            if ("divider" in item) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-1 border-t border-[rgba(147,130,255,0.1)]"
                />
              );
            }

            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left",
                  item.disabled
                    ? "opacity-50 cursor-not-allowed text-slate-500"
                    : item.destructive
                    ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    : "text-slate-300 hover:bg-violet-600/15 hover:text-violet-200"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  {item.icon && (
                    <span className="h-4 w-4 shrink-0 text-current">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </div>
                {item.badge && <span className="ml-2">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
