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

export const honingBrackets: HoningBracket[] = [
  { from: 1700, to: 1710, averageGold: 371137 },
  { from: 1710, to: 1720, averageGold: 354992 },
  { from: 1720, to: 1730, averageGold: 436913 },
  { from: 1730, to: 1740, averageGold: 258061 },
  { from: 1740, to: 1750, averageGold: 373564 },
];

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