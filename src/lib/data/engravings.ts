export interface EngravingGoal {
  id: string;
  name: string;
  remaining: number;
  defaultCost: number;
}

export const engravingGoals: EngravingGoal[] = [
  {
    id: "ambush-master",
    name: "Ambush Master",
    remaining: 18,
    defaultCost: 49291
  },
  {
    id: "keen-blunt-weapon",
    name: "Keen Blunt Weapon",
    remaining: 17,
    defaultCost: 104078
  }
];