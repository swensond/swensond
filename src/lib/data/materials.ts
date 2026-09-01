import abidosFusionMaterial from "$lib/assets/abidosFusionMaterial.png";
import destinyCrystallizedDestructionStone from "$lib/assets/destinyCrystallizedDestructionStone.png";
import destinyCrystallizedGuardianStone from "$lib/assets/destinyCrystallizedGuardianStone.png";
import destinyDestructionStone from "$lib/assets/destinyDestructionStone.png";
import destinyGuardianStone from "$lib/assets/destinyGuardianStone.png";
import destinyLeapstone from "$lib/assets/destinyLeapstone.png";
import destinyShard from "$lib/assets/destinyShard.png";
import glacierBreath from "$lib/assets/glacierBreath.png";
import greatDestinyLeapstone from "$lib/assets/greatDestinyLeapstone.png";
import lavaBreath from "$lib/assets/lavaBreath.png";
import metallurgyBook from "$lib/assets/metallurgyBook.png";
import metallurgyLvl1 from "$lib/assets/metallurgyLvl1.png";
import metallurgyLvl2 from "$lib/assets/metallurgyLvl2.png";
import metallurgyLvl3 from "$lib/assets/metallurgyLvl3.png";
import metallurgyLvl4 from "$lib/assets/metallurgyLvl4.png";
import superiorAbidosFusionMaterial from "$lib/assets/superiorAbidosFusionMaterial.png";
import tailoringBook from "$lib/assets/tailoringBook.png";
import tailoringLvl1 from "$lib/assets/tailoringLvl1.png";
import tailoringLvl2 from "$lib/assets/tailoringLvl2.png";
import tailoringLvl3 from "$lib/assets/tailoringLvl3.png";
import tailoringLvl4 from "$lib/assets/tailoringLvl4.png";

export const materialSeed = [
  {
    id: "destinyShard",
    name: "Destiny Shard",
    amount: 0,
    pricingOptions: [
      { label: "Small", marketSize: 1000, marketPrice: 213 },
      { label: "Medium", marketSize: 2000, marketPrice: 490 },
      { label: "Large", marketSize: 3000, marketPrice: 610 },
    ],
    icon: destinyShard,
  },

  {
    id: "abidosFusionMaterial",
    name: "Abidos Fusion Material",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 1,
      marketPrice: 122,
    },
    icon: abidosFusionMaterial,
  },

  {
    id: "superiorAbidosFusionMaterial",
    name: "Superior Abidos Fusion Material",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 1,
      marketPrice: 160,
    },
    icon: superiorAbidosFusionMaterial,
  },

  {
    id: "destinyDestructionStone",
    name: "Destiny Destruction Stone",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 100,
      marketPrice: 550,
    },
    icon: destinyDestructionStone,
  },

  {
    id: "destinyGuardianStone",
    name: "Destiny Guardian Stone",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 100,
      marketPrice: 12,
    },
    icon: destinyGuardianStone,
  },

  {
    id: "destinyCrystallizedDestructionStone",
    name: "Crystallized Destruction Stone",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 100,
      marketPrice: 2745,
    },
    icon: destinyCrystallizedDestructionStone,
  },

  {
    id: "destinyCrystallizedGuardianStone",
    name: "Crystallized Guardian Stone",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 100,
      marketPrice: 110,
    },
    icon: destinyCrystallizedGuardianStone,
  },

  {
    id: "destinyLeapstone",
    name: "Destiny Leapstone",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 1,
      marketPrice: 16,
    },
    icon: destinyLeapstone,
  },

  {
    id: "greatDestinyLeapstone",
    name: "Great Destiny Leapstone",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 1,
      marketPrice: 53,
    },
    icon: greatDestinyLeapstone,
  },

  {
    id: "lavaBreath",
    name: "Lava Breath",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 1,
      marketPrice: 283,
    },
    icon: lavaBreath,
  },

  {
    id: "glacierBreath",
    name: "Glacier Breath",
    amount: 0,
    pricing: {
      label: "Default",
      marketSize: 1,
      marketPrice: 284,
    },
    icon: glacierBreath,
  },
  {
    id: "tailoringBook11to14",
    name: "Tailoring: Hellfire [11-14]",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 1850 },
    icon: tailoringBook,
  },
  {
    id: "tailoringBook15to18",
    name: "Tailoring: Hellfire [15-18]",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 2100 },
    icon: tailoringBook,
  },
  {
    id: "tailoringBook19to20",
    name: "Tailoring: Hellfire [19-20]",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 2395 },
    icon: tailoringBook,
  },
  {
    id: "metallurgyBook11to14",
    name: "Metallurgy: Hellfire [11-14]",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 1900 },
    icon: metallurgyBook,
  },
  {
    id: "metallurgyBook15to18",
    name: "Metallurgy: Hellfire [15-18]",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 2200 },
    icon: metallurgyBook,
  },
  {
    id: "metallurgyBook19to20",
    name: "Metallurgy: Hellfire [19-20]",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 3599 },
    icon: metallurgyBook,
  }, {
    id: "tailoringScrollLv1",
    name: "Artisan's Tailoring: Level 1",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 450 },
    icon: tailoringLvl1,
  },
  {
    id: "tailoringScrollLv2",
    name: "Artisan's Tailoring: Level 2",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 650 },
    icon: tailoringLvl2,
  },
  {
    id: "tailoringScrollLv3",
    name: "Artisan's Tailoring: Level 3",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 1464 },
    icon: tailoringLvl3,
  },
  {
    id: "tailoringScrollLv4",
    name: "Artisan's Tailoring: Level 4",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 1443 },
    icon: tailoringLvl4,
  },
  {
    id: "metallurgyScrollLv1",
    name: "Artisan's Metallurgy: Level 1",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 480 },
    icon: metallurgyLvl1,
  },
  {
    id: "metallurgyScrollLv2",
    name: "Artisan's Metallurgy: Level 2",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 680 },
    icon: metallurgyLvl2,
  },
  {
    id: "metallurgyScrollLv3",
    name: "Artisan's Metallurgy: Level 3",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 825 },
    icon: metallurgyLvl3,
  },
  {
    id: "metallurgyScrollLv4",
    name: "Artisan's Metallurgy: Level 4",
    amount: 0,
    pricing: { label: "Default", marketSize: 1, marketPrice: 1100 },
    icon: metallurgyLvl4,
  }
];
