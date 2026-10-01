export type AnimalType =
  | "WOLF"
  | "RABBIT"
  | "FOX"
  | "CAT"
  | "DOG"
  | "BEAR"
  | "PANDA"
  | "TIGER"
  | "DEER"
  | "PENGUIN";

export type CompanionMood =
  | "ECSTATIC"
  | "EXCITED"
  | "HAPPY"
  | "CONTENT"
  | "PROUD"
  | "RESTING"
  | "SLEEPY";

export interface CompanionResponse {
  id: number;
  userId: number;
  userName: string;
  animalType: AnimalType;
  animalEmoji: string;
  name: string;
  level: number;
  xp: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  levelProgressXp: number;
  levelTargetXp: number;
  levelProgressPercentage: number;
  happiness: number;
  energy: number;
  mood: CompanionMood;
  moodEmoji: string;
  moodDescription: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChooseCompanionRequest {
  animalType: AnimalType;
  name: string;
}

export interface UpdateCompanionRequest {
  animalType?: AnimalType;
  name?: string;
}

export interface CompanionHistoryResponse {
  id: number;
  eventType: string;
  xpGained: number;
  title: string;
  description?: string | null;
  icon?: string | null;
  createdAt: string;
}
