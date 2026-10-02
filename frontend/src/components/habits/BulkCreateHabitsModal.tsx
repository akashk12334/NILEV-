import * as React from "react";
import { Plus, Trash2, Loader2, Sparkles, Calendar, Clock, Layers, Infinity as InfinityIcon } from "lucide-react";
import { Button, Modal } from "../ui";
import type { HabitFrequency, HabitTimeOfDay, CreateHabitRequest } from "../../types";

interface HabitRow {
  id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  timeOfDay: HabitTimeOfDay;
  category: string;
  icon: string;
  color: string;
  startDate: string;
  endDate: string;
}

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKDAYS", label: "Weekdays" },
  { value: "WEEKENDS", label: "Weekends" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "CUSTOM", label: "Custom" },
];

const CATEGORIES = [
  "General", "Health", "Fitness", "Mindfulness", "Growth",
  "Connection", "Finance", "Creativity", "Learning", "Sleep",
];

const ICONS = ["⭐", "🏃", "📖", "💧", "🧘", "💪", "🌅", "🎯", "🍎", "✍️", "❤️", "🌱"];

const COLORS = [
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#0EA5E9", // Sky
  "#F43F5E", // Rose
];

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

interface BulkCreateHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habits: CreateHabitRequest[]) => Promise<void>;
  submitting: boolean;
}

export const BulkCreateHabitsModal: React.FC<BulkCreateHabitsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}) => {
  const [rows, setRows] = React.useState<HabitRow[]>([
    {
      id: "1",
      name: "",
      description: "",
      frequency: "DAILY",
      timeOfDay: "ANYTIME",
      category: "General",
      icon: "⭐",
      color: "#8B5CF6",
      startDate: getTodayString(),
      endDate: "",
    },
    {
      id: "2",
      name: "",
      description: "",
      frequency: "DAILY",
      timeOfDay: "ANYTIME",
      category: "General",
      icon: "📖",
      color: "#EC4899",
      startDate: getTodayString(),
      endDate: "",
    },
  ]);

  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setRows([
        {
          id: "1",
          name: "",
          description: "",
          frequency: "DAILY",
          timeOfDay: "ANYTIME",
          category: "General",
          icon: "⭐",
          color: "#8B5CF6",
          startDate: getTodayString(),
          endDate: "",
        },
        {
          id: "2",
          name: "",
          description: "",
          frequency: "DAILY",
          timeOfDay: "ANYTIME",
          category: "General",
          icon: "📖",
          color: "#EC4899",
          startDate: getTodayString(),
          endDate: "",
        },
      ]);
      setFormError(null);
    }
  }, [isOpen]);

  const handleAddRow = () => {
    const nextId = String(Date.now() + Math.random());
    const icons = ICONS;
    const randomIcon = icons[rows.length % icons.length] || "⭐";
    const colors = COLORS;
    const randomColor = colors[rows.length % colors.length] || "#8B5CF6";

    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        name: "",
        description: "",
        frequency: "DAILY",
        timeOfDay: "ANYTIME",
        category: "General",
        icon: randomIcon,
        color: randomColor,
        startDate: getTodayString(),
        endDate: "",
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleChange = (id: string, field: keyof HabitRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    const validRows = rows.filter((r) => r.name.trim().length > 0);
    if (validRows.length === 0) {
      setFormError("Please enter at least one habit name.");
      return;
    }

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      if (r.startDate && r.endDate && new Date(r.endDate) < new Date(r.startDate)) {
        setFormError(`Habit "${r.name}": End Date cannot be before Start Date.`);
        return;
      }
    }

    const payload: CreateHabitRequest[] = validRows.map((r) => ({
      name: r.name.trim(),
      description: r.description.trim() || undefined,
      frequency: r.frequency,
      timeOfDay: r.timeOfDay,
      category: r.category,
      icon: r.icon,
      color: r.color,
      startDate: r.startDate || undefined,
      endDate: r.endDate || undefined,
    }));

    await onSubmit(payload);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Multiple Habits"
      description="Create several habits together in one single operation."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 relative space-y-3 transition-all hover:border-slate-700"
              style={{ borderLeftColor: row.color, borderLeftWidth: 4 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Habit {index + 1}
                </span>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Remove this habit row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Name & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className={labelCls}>Name *</label>
                  <input
                    value={row.name}
                    onChange={(e) => handleChange(row.id, "name", e.target.value)}
                    placeholder="e.g. Morning Workout"
                    className={inputCls}
                    required
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className={labelCls}>Icon</label>
                  <select
                    value={row.icon}
                    onChange={(e) => handleChange(row.id, "icon", e.target.value)}
                    className={inputCls}
                  >
                    {ICONS.map((ic) => (
                      <option key={ic} value={ic}>{ic} Icon</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <input
                  value={row.description}
                  onChange={(e) => handleChange(row.id, "description", e.target.value)}
                  placeholder="e.g. Exercise for 30 minutes"
                  className={inputCls}
                  maxLength={500}
                />
              </div>

              {/* Frequency, Category, TimeOfDay */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Frequency</label>
                  <select
                    value={row.frequency}
                    onChange={(e) => handleChange(row.id, "frequency", e.target.value)}
                    className={inputCls}
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={row.category}
                    onChange={(e) => handleChange(row.id, "category", e.target.value)}
                    className={inputCls}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Accent Color</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleChange(row.id, "color", col)}
                        className={`h-5 w-5 rounded-full transition-transform ${
                          row.color === col ? "scale-125 ring-2 ring-white/60" : "opacity-70 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Start & End Dates with Endless toggle */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <span className={labelCls}>Schedule Duration</span>
                  <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleChange(row.id, "endDate", "")}
                      className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${
                        !row.endDate
                          ? "bg-violet-600 text-white shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <InfinityIcon className="h-3 w-3" />
                      <span>Endless</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const base = row.startDate ? new Date(row.startDate) : new Date();
                        base.setDate(base.getDate() + 30);
                        handleChange(row.id, "endDate", base.toISOString().split("T")[0]);
                      }}
                      className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${
                        row.endDate
                          ? "bg-pink-600 text-white shadow-[0_0_8px_rgba(236,72,153,0.4)]"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>End Date</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-violet-400" /> Start Date
                      </span>
                    </label>
                    <input
                      type="date"
                      value={row.startDate}
                      onChange={(e) => handleChange(row.id, "startDate", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-pink-400" /> End Date
                        </span>
                      </label>
                      {row.endDate && (
                        <button
                          type="button"
                          onClick={() => handleChange(row.id, "endDate", "")}
                          className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-violet-950/40"
                        >
                          <InfinityIcon className="h-3 w-3" />
                          <span>Make Endless</span>
                        </button>
                      )}
                    </div>
                    {!row.endDate ? (
                      <button
                        type="button"
                        onClick={() => {
                          const base = row.startDate ? new Date(row.startDate) : new Date();
                          base.setDate(base.getDate() + 30);
                          handleChange(row.id, "endDate", base.toISOString().split("T")[0]);
                        }}
                        className="w-full flex items-center justify-between h-[42px] px-3 rounded-xl border border-dashed border-violet-500/40 bg-violet-950/20 text-violet-300 text-xs hover:border-violet-400 hover:bg-violet-950/40 transition-all text-left group"
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <InfinityIcon className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-transform" />
                          <span>Endless Routine (No expiration)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 group-hover:text-violet-300 transition-colors">Set date →</span>
                      </button>
                    ) : (
                      <input
                        type="date"
                        value={row.endDate}
                        min={row.startDate || undefined}
                        onChange={(e) => handleChange(row.id, "endDate", e.target.value)}
                        className={inputCls}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Habit button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="w-full border-dashed border-violet-500/30 hover:border-violet-500 text-violet-300 py-2.5"
        >
          + Add Another Habit
        </Button>

        {/* Footer controls */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            size="sm"
            className="w-full sm:flex-1 py-2.5"
            disabled={submitting}
            leftIcon={submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          >
            {submitting ? "Creating habits..." : `Create All Habits (${rows.filter((r) => r.name.trim()).length})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
