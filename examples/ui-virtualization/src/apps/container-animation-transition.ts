export interface Person {
  fname: string;
  lname: string;
}

const fNames = [
  // tslint:disable-next-line:max-line-length
  'Ford', 'Arthur', 'Trillian', 'Sneezy', 'Sleepy', 'Dopey', 'Doc', 'Happy', 'Bashful', 'Grumpy', 'Mufasa', 'Sarabi', 'Simba', 'Nala', 'Kiara', 'Kovu', 'Timon', 'Pumbaa', 'Rafiki', 'Shenzi'
];
const lNames = [
  // tslint:disable-next-line:max-line-length
  'Prefect', 'Dent', 'Astra', 'Adams', 'Baker', 'Clark', 'Davis', 'Evans', 'Frank', 'Ghosh', 'Hills', 'Irwin', 'Jones', 'Klein', 'Lopez', 'Mason', 'Nalty', 'Ochoa', 'Patel', 'Quinn', 'Reily', 'Smith', 'Trott', 'Usman', 'Valdo', 'White', 'Xiang', 'Yakub', 'Zafar'
];

export class ContainerAnimationTransition {
  private people: Person[];

  ctHeight = 300;
  ctWidth = 600;
  ctBorder = 0;
  ctBorderCss = '15px solid royalblue';
  ctWidthCss = '50%';
  ctHeightCss = '50%';

  constructor() {
    this.people = [];
    this.push(500);
  }

  push(count = 30): void {
    while (count-- > 0) {
      this.people.push({
        fname: fNames[Math.floor(Math.random() * fNames.length)],
        lname: lNames[Math.floor(Math.random() * lNames.length)]
      });
    }
  }

  resizeAndMutate(): void {
    const hSeed = Math.random();
    const wSeed = Math.random();
    const borderSeed = Math.random();
    this.ctHeight = hSeed > 0.1 ? (200 + Math.round(Math.random()  * 400)) : 0;
    this.ctWidth = wSeed > 0.1 ? (200 + Math.round(Math.random() * 400)) : 0;
    this.ctBorder = borderSeed > 0.1 ? Math.round(Math.random() * 50) : 0;

    const collectionSeed = Math.random();
    if (collectionSeed > 0.1) {
      this.people.splice(0, Math.floor(Math.random() * this.people.length));
      this.push(Math.round(Math.random() * 50));
    } else {
      this.people = collectionSeed > 0.8 ? undefined : collectionSeed > 0.7 ? null : [];
    }
  }
}
