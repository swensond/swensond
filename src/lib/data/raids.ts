export interface Raid {
  id: string;
  name: string;
  minItemLevel: number;
  gold: number;
}

export const raids: Raid[] = [
  {
    id: "cathedral-stage-1",
    name: "Cathedral Stage 1",
    minItemLevel: 1700,
    gold: 30000,
  },
  {
    id: "cathedral-stage-2",
    name: "Cathedral Stage 2",
    minItemLevel: 1730,
    gold: 40000,
  },
  {
    id: "cathedral-stage-3",
    name: "Cathedral Stage 3",
    minItemLevel: 1750,
    gold: 50000,
  },
  {
    id: "serca-nm",
    name: "Serca NM",
    minItemLevel: 1710,
    gold: 35000,
  },
  {
    id: "serca-hm",
    name: "Serca HM",
    minItemLevel: 1730,
    gold: 44000,
  },
  {
    id: "serca-nmr",
    name: "Serca NMR",
    minItemLevel: 1740,
    gold: 54000,
  },
  {
    id: "kazeros-nm",
    name: "Kazeros NM",
    minItemLevel: 1710,
    gold: 40000,
  },
  {
    id: "kazeros-hm",
    name: "Kazeros HM",
    minItemLevel: 1730,
    gold: 52000,
  },
  {
    id: "armoche-hm",
    name: "Armoche HM",
    minItemLevel: 1720,
    gold: 42000,
  }
];
