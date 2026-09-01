export function formatGold(amount: number) {
  return new Intl.NumberFormat("en-US",).format(amount);
}
