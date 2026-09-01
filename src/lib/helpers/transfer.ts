import { sercaTransferCosts } from "$lib/data/transfer";

export const fullTransferCost = Object.values(sercaTransferCosts).reduce((sum, cost) => sum + cost, 0);
