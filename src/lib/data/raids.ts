export interface Raid {
  id: string;
  name: string;
  minItemLevel: number;

  rewardGold: number;
  tradableGold: number;
}

export const raids: Raid[] = [
  {
    id: "belgardin-nm",
    name: "Belgardin NM",
    minItemLevel: 1750,
    rewardGold: 50000,
    tradableGold: 50000,
  },
  {
    id: "belgardin-hm",
    name: "Belgardin HM",
    minItemLevel: 1770,
    rewardGold: 62000,
    tradableGold: 62000,
  },
  {
    id: "belgardin-nmr",
    name: "Belgardin NMR",
    minItemLevel: 1780,
    rewardGold: 75000,
    tradableGold: 75000,
  },
  {
    id: "cathedral-stage-1",
    name: "Cathedral Stage 1",
    minItemLevel: 1700,
    rewardGold: 30000,
    tradableGold: 0,
  },
  {
    id: "cathedral-stage-2",
    name: "Cathedral Stage 2",
    minItemLevel: 1730,
    rewardGold: 40000,
    tradableGold: 0,
  },
  {
    id: "cathedral-stage-3",
    name: "Cathedral Stage 3",
    minItemLevel: 1750,
    rewardGold: 50000,
    tradableGold: 0,
  },
  {
    id: "serca-nm",
    name: "Serca NM",
    minItemLevel: 1710,
    rewardGold: 35000,
    tradableGold: 35000
  },
  {
    id: "serca-hm",
    name: "Serca HM",
    minItemLevel: 1730,
    rewardGold: 44000,
    tradableGold: 44000
  },
  {
    id: "serca-nmr",
    name: "Serca NMR",
    minItemLevel: 1740,
    rewardGold: 54000,
    tradableGold: 54000
  },
  {
    id: "kazeros-nm",
    name: "Kazeros NM",
    minItemLevel: 1710,
    rewardGold: 40000,
    tradableGold: 40000
  },
  {
    id: "kazeros-hm",
    name: "Kazeros HM",
    minItemLevel: 1730,
    rewardGold: 52000,
    tradableGold: 52000
  },
  {
    id: "armoche-hm",
    name: "Armoche HM",
    minItemLevel: 1720,
    rewardGold: 42000,
    tradableGold: 42000
  },
    {
    id: "armoche-nm",
    name: "Armoche NM",
    minItemLevel: 1700,
    rewardGold: 33000,
    tradableGold: 33000
  }
];
