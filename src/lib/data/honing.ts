import abidosFusionMaterial from '$lib/assets/abidosFusionMaterial.png';
import destinyCrystallizedDestructionStone from '$lib/assets/destinyCrystallizedDestructionStone.png';
import destinyCrystallizedGuardianStone from '$lib/assets/destinyCrystallizedGuardianStone.png';
import destinyDestructionStone from '$lib/assets/destinyDestructionStone.png';
import destinyGuardianStone from '$lib/assets/destinyGuardianStone.png';
import destinyLeapstone from '$lib/assets/destinyLeapstone.png';
import destinyShard from '$lib/assets/destinyShard.png';
import glacierBreath from '$lib/assets/glacierBreath.png';
import greatDestinyLeapstone from '$lib/assets/greatDestinyLeapstone.png';
import lavaBreath from '$lib/assets/lavaBreath.png';
import superiorAbidosFusionMaterial from '$lib/assets/superiorAbidosFusionMaterial.png';

export interface HoningBracket {
  from: number;
  to: number;
  averageGold: number;
}

export const armorGoldTable: Record<number, number> = {
  1: 376,
  2: 384,
  3: 392,
  4: 844,
  5: 893,
  6: 958,
  7: 1465,
  8: 1600,
  9: 3066,
  10: 3416,
  11: 5152,
  12: 5683,
  13: 10894,
  14: 12084,
  15: 16002,
  16: 17536,
  17: 24603,
  18: 26979,
  19: 36869,
  20: 74423,
  21: 80894,
  22: 127779,
  23: 137681,
  24: 287662,
  25: 309579
};

export const weaponGoldTable: Record<number, number> = {
  1: 624,
  2: 632,
  3: 648,
  4: 1396,
  5: 1477,
  6: 1607,
  7: 2434,
  8: 2682,
  9: 5084,
  10: 5666,
  11: 8603,
  12: 9506,
  13: 18217,
  14: 20140,
  15: 26633,
  16: 29264,
  17: 41098,
  18: 45012,
  19: 61332,
  20: 123929,
  21: 134607,
  22: 212651,
  23: 229625,
  24: 479436,
  25: 515964
};

export const advancedWeaponGoldTable = [
  { from: 0, to: 11, gold: 3884 },
  { from: 11, to: 21, gold: 8622 },
  { from: 21, to: 31, gold: 20819 },
  { from: 31, to: 41, gold: 27758 },
];

export const advancedArmorGoldTable = [
  { from: 0, to: 11, gold: 3277 },
  { from: 11, to: 21, gold: 6208 },
  { from: 21, to: 31, gold: 13879 },
  { from: 31, to: 41, gold: 16655 },
];

export const postResetArmorGoldTable: Record<number, number> = {
  1: 1346,
  2: 1425,
  3: 1504,
  4: 2130,
  5: 2333,
  6: 3522,
  7: 3944,
  8: 7519,
  9: 8490,
  10: 12945,
  11: 14604,
  12: 28035,
  13: 30896,
  14: 40415,
  15: 44525,
  16: 47950,
  17: 66399,
  18: 71641,
  19: 77757,
  20: 153698,
  21: 165023,
  22: 256973,
  23: 271118,
  24: 557059,
  25: 584455
};

export const postResetWeaponGoldTable: Record<number, number> = {
  1: 2453,
  2: 2532,
  3: 2612,
  4: 3651,
  5: 3955,
  6: 6057,
  7: 6620,
  8: 12613,
  9: 14068,
  10: 21574,
  11: 24229,
  12: 46343,
  13: 51493,
  14: 67815,
  15: 73980,
  16: 80145,
  17: 111830,
  18: 120567,
  19: 129303,
  20: 257242,
  21: 275038,
  22: 426716,
  23: 452649,
  24: 926909,
  25: 977135
};

export const totalMaterials = {
  destinyShard: {
    amount: 2_276_530 + 1_734_776 + 2_377_272 + 1_488_919 + 2_041_467, // 9,918,964
    pricePerUnit: 219 / 1000,                                            // 0.219
    icon: destinyShard
  },
  abidosFusionMaterial: {
    amount: 3_143 + 3_086 + 3_414,                                       // 9,643
    pricePerUnit: 122,
    icon: abidosFusionMaterial
  },
  superiorAbidosFusionMaterial: {
    amount: 1_159 + 1_699,                                               // 2,858
    pricePerUnit: 160,
    icon: superiorAbidosFusionMaterial
  },
  destinyDestructionStone: {
    amount: 71_371 + 32_769 + 38_230,                                    // 142,370
    pricePerUnit: 538 / 100,                                             // 5.38
    icon: destinyDestructionStone
  },
  destinyGuardianStone: {
    amount: 214_111 + 136_536 + 163_843,                                 // 514,490
    pricePerUnit: 11 / 100,                                              // 0.11
    icon: destinyGuardianStone
  },
  destinyCrystallizedDestructionStone: {
    amount: 27_010 + 39_299,                                             // 66,309
    pricePerUnit: 3_075 / 100,                                           // 30.75
    icon: destinyCrystallizedDestructionStone
  },
  destinyCrystallizedGuardianStone: {
    amount: 73_732 + 106_604,                                            // 180,336
    pricePerUnit: 98 / 100,                                              // 0.98
    icon: destinyCrystallizedGuardianStone
  },
  destinyLeapstone: {
    amount: 4_375 + 3_141 + 4_015,                                       // 11,531
    pricePerUnit: 15,
    icon: destinyLeapstone
  },
  greatDestinyLeapstone: {
    amount: 1_137 + 1_618,                                               // 2,755
    pricePerUnit: 53,
    icon: greatDestinyLeapstone
  },
  lavasBreath: {
    amount: 576 + 569 + 682 + 298 + 358,                                 // 2,483
    pricePerUnit: 283,
    icon: lavaBreath
  },
  glaciersBreath: {
    amount: 2_877 + 2_841 + 3_409 + 1_488 + 1_787,                      // 12,402
    pricePerUnit: 284,
    icon: glacierBreath
  }
};



[
  {
    "Honing Stage": "Armor +1",
    "Gold": 376,
    "Honor Shards": 10800,
    "Abidos Fusion Material": 3,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 210,
    "Destiny Leapstone": 7,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +2",
    "Gold": 384,
    "Honor Shards": 10860,
    "Abidos Fusion Material": 3,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 270,
    "Destiny Leapstone": 8,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +3",
    "Gold": 392,
    "Honor Shards": 10920,
    "Abidos Fusion Material": 3,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 330,
    "Destiny Leapstone": 8,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +4",
    "Gold": 844,
    "Honor Shards": 13016,
    "Abidos Fusion Material": 9,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 791,
    "Destiny Leapstone": 19,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +5",
    "Gold": 893,
    "Honor Shards": 13260,
    "Abidos Fusion Material": 9,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 913,
    "Destiny Leapstone": 19,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +6",
    "Gold": 958,
    "Honor Shards": 13503,
    "Abidos Fusion Material": 9,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 974,
    "Destiny Leapstone": 19,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +7",
    "Gold": 1465,
    "Honor Shards": 16592,
    "Abidos Fusion Material": 15,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 1522,
    "Destiny Leapstone": 29,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +8",
    "Gold": 1600,
    "Honor Shards": 17099,
    "Abidos Fusion Material": 15,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 1691,
    "Destiny Leapstone": 29,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +9",
    "Gold": 3066,
    "Honor Shards": 22807,
    "Abidos Fusion Material": 30,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 3057,
    "Destiny Leapstone": 54,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +10",
    "Gold": 3416,
    "Honor Shards": 25680,
    "Abidos Fusion Material": 30,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 3348,
    "Destiny Leapstone": 54,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +11",
    "Gold": 3237,
    "Honor Shards": 24512,
    "Abidos Fusion Material": 30,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 3128,
    "Destiny Leapstone": 46,
    "Other Materials": {
      "Tailoring: Hellfire [11-14]": 5
    }
  },
  {
    "Honing Stage": "Armor +12",
    "Gold": 3570,
    "Honor Shards": 26263,
    "Abidos Fusion Material": 30,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 3254,
    "Destiny Leapstone": 55,
    "Other Materials": {
      "Tailoring: Hellfire [11-14]": 5
    }
  },
  {
    "Honing Stage": "Armor +13",
    "Gold": 7163,
    "Honor Shards": 53308,
    "Abidos Fusion Material": 68,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 6320,
    "Destiny Leapstone": 106,
    "Other Materials": {
      "Tailoring: Hellfire [11-14]": 8
    }
  },
  {
    "Honing Stage": "Armor +14",
    "Gold": 7945,
    "Honor Shards": 59017,
    "Abidos Fusion Material": 68,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 6997,
    "Destiny Leapstone": 121,
    "Other Materials": {
      "Tailoring: Hellfire [11-14]": 8
    }
  },
  {
    "Honing Stage": "Armor +15",
    "Gold": 10552,
    "Honor Shards": 72701,
    "Abidos Fusion Material": 100,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 9215,
    "Destiny Leapstone": 163,
    "Other Materials": {
      "Tailoring: Hellfire [15-18]": 9
    }
  },
  {
    "Honing Stage": "Armor +16",
    "Gold": 11564,
    "Honor Shards": 79953,
    "Abidos Fusion Material": 100,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 10570,
    "Destiny Leapstone": 181,
    "Other Materials": {
      "Tailoring: Hellfire [15-18]": 9
    }
  },
  {
    "Honing Stage": "Armor +17",
    "Gold": 16313,
    "Honor Shards": 122417,
    "Abidos Fusion Material": 174,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 15294,
    "Destiny Leapstone": 255,
    "Other Materials": {
      "Tailoring: Hellfire [15-18]": 12
    }
  },
  {
    "Honing Stage": "Armor +18",
    "Gold": 17889,
    "Honor Shards": 134674,
    "Abidos Fusion Material": 174,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 17031,
    "Destiny Leapstone": 267,
    "Other Materials": {
      "Tailoring: Hellfire [15-18]": 12
    }
  },
  {
    "Honing Stage": "Armor +19",
    "Gold": 24452,
    "Honor Shards": 146257,
    "Abidos Fusion Material": 174,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 18774,
    "Destiny Leapstone": 290,
    "Other Materials": {
      "Lava Breath": 1,
      "Tailoring: Hellfire [19-20]": 12
    }
  },
  {
    "Honing Stage": "Armor +20",
    "Gold": 49621,
    "Honor Shards": 270114,
    "Abidos Fusion Material": 454,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 38187,
    "Destiny Leapstone": 583,
    "Other Materials": {
      "Tailoring: Hellfire [19-20]": 22
    }
  },
  {
    "Honing Stage": "Armor +21",
    "Gold": 80613,
    "Honor Shards": 402835,
    "Abidos Fusion Material": 678,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 61911,
    "Destiny Leapstone": 936,
    "Other Materials": {
      "Lava Breath": 3
    }
  },
  {
    "Honing Stage": "Armor +22",
    "Gold": 127473,
    "Honor Shards": 594655,
    "Abidos Fusion Material": 988,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 104425,
    "Destiny Leapstone": 1459,
    "Other Materials": {
      "Lava Breath": 2
    }
  },
  {
    "Honing Stage": "Armor +23",
    "Gold": 137351,
    "Honor Shards": 632878,
    "Abidos Fusion Material": 988,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 112892,
    "Destiny Leapstone": 1600,
    "Other Materials": {
      "Lava Breath": 2
    }
  },
  {
    "Honing Stage": "Armor +24",
    "Gold": 287662,
    "Honor Shards": 1219769,
    "Abidos Fusion Material": 2740,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 230129,
    "Destiny Leapstone": 3288,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Armor +25",
    "Gold": 309579,
    "Honor Shards": 1292041,
    "Abidos Fusion Material": 2740,
    "Destiny Destruction Stone": 0,
    "Destiny Guardian Stone": 246567,
    "Destiny Leapstone": 3653,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Weapon +1",
    "Gold": 624,
    "Honor Shards": 18000,
    "Abidos Fusion Material": 5,
    "Destiny Destruction Stone": 18000,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 12,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Weapon +2",
    "Gold": 632,
    "Honor Shards": 18100,
    "Abidos Fusion Material": 5,
    "Destiny Destruction Stone": 18100,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 13,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Weapon +3",
    "Gold": 648,
    "Honor Shards": 18200,
    "Abidos Fusion Material": 5,
    "Destiny Destruction Stone": 18200,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 14,
    "Other Materials": {}
  },
  {
    "Honing Stage": "Weapon +4",
    "Gold": 1374,
    "Honor Shards": 21591,
    "Abidos Fusion Material": 12,
    "Destiny Destruction Stone": 21591,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 30,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 1
    }
  },
  {
    "Honing Stage": "Weapon +5",
    "Gold": 1399,
    "Honor Shards": 21723,
    "Abidos Fusion Material": 12,
    "Destiny Destruction Stone": 21723,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 29,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 3
    }
  },
  {
    "Honing Stage": "Weapon +6",
    "Gold": 1461,
    "Honor Shards": 22821,
    "Abidos Fusion Material": 12,
    "Destiny Destruction Stone": 22821,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 28,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 4
    }
  },
  {
    "Honing Stage": "Weapon +7",
    "Gold": 1686,
    "Honor Shards": 24608,
    "Abidos Fusion Material": 16,
    "Destiny Destruction Stone": 24608,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 32,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 22
    }
  },
  {
    "Honing Stage": "Weapon +8",
    "Gold": 1583,
    "Honor Shards": 23983,
    "Abidos Fusion Material": 14,
    "Destiny Destruction Stone": 23983,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 27,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 30
    }
  },
  {
    "Honing Stage": "Weapon +9",
    "Gold": 3403,
    "Honor Shards": 32287,
    "Abidos Fusion Material": 33,
    "Destiny Destruction Stone": 32287,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 59,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 48
    }
  },
  {
    "Honing Stage": "Weapon +10",
    "Gold": 3536,
    "Honor Shards": 34228,
    "Abidos Fusion Material": 31,
    "Destiny Destruction Stone": 34228,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 55,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 5
    }
  },
  {
    "Honing Stage": "Weapon +11",
    "Gold": 5405,
    "Honor Shards": 41853,
    "Abidos Fusion Material": 51,
    "Destiny Destruction Stone": 41853,
    "Destiny Guardian Stone": 0,
    "Destiny Leapstone": 76,
    "Other Materials": {
      "Metallurgy: Hellfire [11-14]": 5
    }
  },
  {
    "Honing Stage": "Weapon +12",
    "Gold": 5973,
    "Honor Shards": 45104,
    "Abidos Fusion Material": 51, "Destiny Destruction Stone": 45104, "Destiny Guardian Stone": 0, "Destiny Leapstone": 88, "Other Materials": { "Metallurgy: Hellfire [11-14]": 5 }
  }, { "Honing Stage": "Weapon +13", "Gold": 11835, "Honor Shards": 89499, "Abidos Fusion Material": 112, "Destiny Destruction Stone": 10408, "Destiny Guardian Stone": 0, "Destiny Leapstone": 179, "Other Materials": { "Glacier Breath": 2, "Metallurgy: Hellfire [11-14]": 8 } }, { "Honing Stage": "Weapon +14", "Gold": 12775, "Honor Shards": 97517, "Abidos Fusion Material": 109, "Destiny Destruction Stone": 11251, "Destiny Guardian Stone": 0, "Destiny Leapstone": 196, "Other Materials": { "Glacier Breath": 10, "Metallurgy: Hellfire [11-14]": 8 } }, { "Honing Stage": "Weapon +15", "Gold": 16009, "Honor Shards": 115469, "Abidos Fusion Material": 149, "Destiny Destruction Stone": 14000, "Destiny Guardian Stone": 0, "Destiny Leapstone": 248, "Other Materials": { "Glacier Breath": 42, "Metallurgy: Hellfire [15-18]": 9 } }, { "Honing Stage": "Weapon +16", "Gold": 15206, "Honor Shards": 115917, "Abidos Fusion Material": 129, "Destiny Destruction Stone": 13882, "Destiny Guardian Stone": 0, "Destiny Leapstone": 235, "Other Materials": { "Glacier Breath": 106, "Metallurgy: Hellfire [15-18]": 8 } }, { "Honing Stage": "Weapon +17", "Gold": 20500, "Honor Shards": 170588, "Abidos Fusion Material": 218, "Destiny Destruction Stone": 19175, "Destiny Guardian Stone": 0, "Destiny Leapstone": 314, "Other Materials": { "Glacier Breath": 166, "Metallurgy: Hellfire [15-18]": 9 } }, { "Honing Stage": "Weapon +18", "Gold": 22452, "Honor Shards": 187432, "Abidos Fusion Material": 218, "Destiny Destruction Stone": 21354, "Destiny Guardian Stone": 0, "Destiny Leapstone": 340, "Other Materials": { "Glacier Breath": 166, "Metallurgy: Hellfire [15-18]": 9 } }, { "Honing Stage": "Weapon +19", "Gold": 30592, "Honor Shards": 204405, "Abidos Fusion Material": 218, "Destiny Destruction Stone": 23533, "Destiny Guardian Stone": 0, "Destiny Leapstone": 367, "Other Materials": { "Glacier Breath": 166, "Metallurgy: Hellfire [19-20]": 9 } }, { "Honing Stage": "Weapon +20", "Gold": 62220, "Honor Shards": 365927, "Abidos Fusion Material": 569, "Destiny Destruction Stone": 47925, "Destiny Guardian Stone": 0, "Destiny Leapstone": 732, "Other Materials": { "Glacier Breath": 394, "Metallurgy: Hellfire [19-20]": 17 } }, { "Honing Stage": "Weapon +21", "Gold": 89752, "Honor Shards": 488930, "Abidos Fusion Material": 756, "Destiny Destruction Stone": 69040, "Destiny Guardian Stone": 0, "Destiny Leapstone": 1036, "Other Materials": { "Glacier Breath": 534 } }, { "Honing Stage": "Weapon +22", "Gold": 141893, "Honor Shards": 707604, "Abidos Fusion Material": 1102, "Destiny Destruction Stone": 116409, "Destiny Guardian Stone": 0, "Destiny Leapstone": 1637, "Other Materials": { "Glacier Breath": 780 } }, { "Honing Stage": "Weapon +23", "Gold": 153219, "Honor Shards": 756066, "Abidos Fusion Material": 1102, "Destiny Destruction Stone": 125847, "Destiny Guardian Stone": 0, "Destiny Leapstone": 1762, "Other Materials": { "Glacier Breath": 780 } }, { "Honing Stage": "Weapon +24", "Gold": 240133, "Honor Shards": 1103087, "Abidos Fusion Material": 2287, "Destiny Destruction Stone": 192107, "Destiny Guardian Stone": 0, "Destiny Leapstone": 2745, "Other Materials": { "Glacier Breath": 2280 } }, { "Honing Stage": "Weapon +25", "Gold": 258429, "Honor Shards": 1173401, "Abidos Fusion Material": 2287, "Destiny Destruction Stone": 205828, "Destiny Guardian Stone": 0, "Destiny Leapstone": 2974, "Other Materials": { "Glacier Breath": 2280 } }]