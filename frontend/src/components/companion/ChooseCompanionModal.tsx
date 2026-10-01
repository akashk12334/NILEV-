import React, { useState } from "react";
import type { AnimalType } from "../../types";
import { ANIMAL_DETAILS, AnimalArtwork } from "./AnimalArtwork";
import { Modal, Button, Input } from "../ui";
import { Sparkles, Check } from "lucide-react";

export interface ChooseCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnimal?: AnimalType;
  currentName?: string;
  onSave: (animalType: AnimalType, name: string) => Promise<void>;
}

const ANIMALS_LIST: AnimalType[] = [
  "WOLF",
  "RABBIT",
  "FOX",
  "CAT",
  "DOG",
  "BEAR",
  "PANDA",
  "TIGER",
  "DEER",
  "PENGUIN",
];

export const ChooseCompanionModal: React.FC<ChooseCompanionModalProps> = ({
  isOpen,
  onClose,
  currentAnimal = "WOLF",
  currentName = "Nova",
  onSave,
}) => {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType>(currentAnimal);
  const [companionName, setCompanionName] = useState<string>(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if initial props change
  React.useEffect(() => {
    setSelectedAnimal(currentAnimal);
    setCompanionName(currentName);
  }, [currentAnimal, currentName, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companionName.trim()) {
      setError("Please provide a name for your companion.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(selectedAnimal, companionName.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update companion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMeta = ANIMAL_DETAILS[selectedAnimal];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Your Astral Companion"
      description="Each partner bonds with their own animal spirit. Select the form that resonates with your spirit."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Selected Preview Hero Banner */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-slate-900 p-4">
          <AnimalArtwork animalType={selectedAnimal} size="md" animate={false} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-xl">{currentMeta.emoji}</span>
              <h3 className="font-bold text-white text-base">{currentMeta.title}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 italic">
              "{currentMeta.lore}"
            </p>
          </div>
        </div>

        {/* Companion Name Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Companion Name
          </label>
          <Input
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder="e.g. Nova, Artemis, Sol, Willow"
            maxLength={50}
            required
            className="bg-slate-900/90 border-slate-700 text-white placeholder-slate-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Give your companion a distinct personal identity.
          </span>
        </div>

        {/* 10 Animals Grid */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Select Animal Form (10 Available)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {ANIMALS_LIST.map((type) => {
              const isSelected = selectedAnimal === type;
              const meta = ANIMAL_DETAILS[type];

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedAnimal(type)}
                  className={`relative flex flex-col items-center justify-center rounded-2xl p-3 border transition-all duration-200 text-center ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-950/60 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400"
                      : "border-white/10 bg-slate-900/40 hover:bg-slate-800/50 hover:border-white/20"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}

                  <div className="w-12 h-12 flex items-center justify-center my-1">
                    <AnimalArtwork animalType={type} size="sm" animate={false} />
                  </div>

                  <span className="text-xs font-bold text-white mt-1">
                    {meta.title.replace("Celestial ", "").replace("Astral ", "")}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                    {type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isSubmitting ? "Forging Bond..." : "Confirm Companion"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
