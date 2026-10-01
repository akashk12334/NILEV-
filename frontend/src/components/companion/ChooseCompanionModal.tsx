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
  "FOX",
  "RABBIT",
  "WOLF",
  "CAT",
  "DOG",
  "BEAR",
  "PANDA",
  "TIGER",
  "DEER",
  "PENGUIN",
];

const DEFAULT_NAMES: Record<AnimalType, string> = {
  FOX: "Ember",
  RABBIT: "Lumi",
  WOLF: "Nova",
  CAT: "Luna",
  DOG: "Milo",
  BEAR: "Koda",
  PANDA: "Bao",
  TIGER: "Kira",
  DEER: "Fawn",
  PENGUIN: "Pip",
};

export const ChooseCompanionModal: React.FC<ChooseCompanionModalProps> = ({
  isOpen,
  onClose,
  currentAnimal = "FOX",
  currentName = "Ember",
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
          <div className="w-24 h-24 flex items-center justify-center shrink-0">
            {selectedAnimal === "FOX" ? (
              <img src="/companions/fox.png" alt="Fox" className="w-24 h-24 object-contain filter drop-shadow-[0_8px_16px_rgba(249,115,22,0.45)]" />
            ) : selectedAnimal === "RABBIT" ? (
              <img src="/companions/bunny.png" alt="Bunny" className="w-24 h-24 object-contain filter drop-shadow-[0_8px_16px_rgba(244,114,182,0.45)]" />
            ) : (
              <AnimalArtwork animalType={selectedAnimal} size="md" animate={false} />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-xl">{currentMeta.emoji}</span>
              <h3 className="font-bold text-white text-base">
                {selectedAnimal === "RABBIT" ? "Moonlit Bunny" : currentMeta.title}
              </h3>
              {(selectedAnimal === "FOX" || selectedAnimal === "RABBIT") && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Featured 3D Companion
                </span>
              )}
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
              const is3D = type === "FOX" || type === "RABBIT";

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedAnimal(type);
                    if (!companionName || Object.values(DEFAULT_NAMES).includes(companionName)) {
                      setCompanionName(DEFAULT_NAMES[type] || "Companion");
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-2xl p-3 border transition-all duration-200 text-center ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-950/60 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400"
                      : "border-white/10 bg-slate-900/40 hover:bg-slate-800/50 hover:border-white/20"
                  }`}
                >
                  {is3D && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ★ 3D
                    </span>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}

                  <div className="w-12 h-12 flex items-center justify-center my-1">
                    <AnimalArtwork animalType={type} size="sm" animate={false} />
                  </div>

                  <span className="text-xs font-bold text-white mt-1">
                    {type === "RABBIT" ? "Bunny" : meta.title.replace("Celestial ", "").replace("Astral ", "").replace("Solar Ember ", "").replace("Moonlit ", "")}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                    {type === "RABBIT" ? "BUNNY" : type}
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
