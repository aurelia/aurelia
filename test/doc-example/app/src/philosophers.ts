import { customElement } from '@aurelia/runtime-html';
import { Philosopher } from './philosopher';

@customElement({
  name: 'philosophers',
  template: `
<p>Philosophers</p>
<div repeat.for="philosopher of philosophers">\${philosopher.state}</div>
`})
export class Philosophers {
  public philosophers: Philosopher[] = [];
  public forks: boolean[] = [];

  public binding() {
    const amount = 5;
    for (let i = 0; i < amount; i++) {
      this.philosophers[i] = new Philosopher(i, amount);
      this.forks[i] = true;
    }
    setTimeout(this.update, 500);
  }

  public update = () => {
    for (const philosopher of this.philosophers) {
      philosopher.update(this.forks);
    }
    setTimeout(this.update, 500);
  }
}
