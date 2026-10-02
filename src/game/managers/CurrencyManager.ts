export class CurrencyManager {
  private static KEY = 'dashlanes_total_coins';

  static getTotalCoins(): number {
    return parseInt(localStorage.getItem(this.KEY) || '0');
  }

  static addCoins(amount: number) {
    const total = this.getTotalCoins() + amount;
    localStorage.setItem(this.KEY, Math.max(0, total).toString());
  }

  static spendCoins(amount: number): boolean {
    const total = this.getTotalCoins();
    if (total < amount) return false;
    localStorage.setItem(this.KEY, (total - amount).toString());
    return true;
  }
}