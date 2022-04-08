export class Philosopher {
  public eatingTime: number;
  public eating = 0;
  public ate = 0;
  public hasForks = false;
  public pickLeft = true;
  public pickRight = true;

  public constructor(
    public position: number,
    public totalAmount: number,
  ) {
    this.eatingTime = Math.floor(Math.random() * 8) + 2;
  }

  public get leftPosition(): number {
    return (this.position + this.totalAmount - 1) % this.totalAmount;
  }
  public get rightPosition(): number {
    return (this.position + 1) % this.totalAmount;
  }

  public get state(): string {
    return this.eating > 0 ? `${this.position} is eating ${this.eating}/${this.eatingTime}` : `${this.position} hasn't eaten in ${this.ate}`;
  }

  public update(forks: boolean[]): void {
    if (this.eating > 0) {
      console.log();
      this.eating--;
      return;
    }
    if (this.hasForks) {
      this.ate = 0;
      forks[this.leftPosition] = true;
      forks[this.rightPosition] = true;
      this.pickLeft = false;
      this.pickRight = false;
      this.hasForks = false;
      console.log(`${this.position} stopped eating`);
      return;
    }
    this.ate++;

    if (!this.pickLeft || !this.pickRight) {
      if (!forks[this.leftPosition]) {
        this.pickLeft = true;
      }
      if (!forks[this.rightPosition]) {
        this.pickRight = true;
      }
      console.log(`${this.position} found new fork`);
      return;
    }
    if (forks[this.leftPosition] && forks[this.rightPosition]) {
      console.log(`${this.position} starting to eat`);
      forks[this.leftPosition] = false;
      forks[this.rightPosition] = false;
      this.hasForks = true;
      this.ate = 0;
      this.eatingTime = Math.floor(Math.random() * 8) + 2;
      this.eating = this.eatingTime;
    }
    console.log(`${this.position} waiting`);
  }
}
