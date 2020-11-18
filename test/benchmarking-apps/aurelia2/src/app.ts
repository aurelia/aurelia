import { customElement, valueConverter } from '@aurelia/runtime-html';
import { IAddressRepository, IPersonRepository, Person } from '@benchmarking-apps/shared';
import template from './app.html';
import { iar, ipr } from './registrations';

// Can we do better? Or this needs to be here for other Fx compat?
// let startTime: number;
// let lastMeasure: string;
const startMeasure = function (name: string) {
  console.time(name)
  // startTime = performance.now();
  // lastMeasure = name;
};
const stopMeasure = function (name: string) {
  window.setTimeout(function () {
    console.timeEnd(name);
    // const stop = performance.now();
    // console.log(`${lastMeasure} took ${stop - startTime}`);
  }, 0);
};

@customElement({ name: 'app', template })
export class App {
  private people: Person[];
  private locale: string = 'en';
  private showAddressDetails: boolean = false;
  public constructor(
    @ipr private readonly personRepository: IPersonRepository,
    @iar private readonly addressRepository: IAddressRepository,
  ) {
    this.people = personRepository.all();
  }

  public changeLocale(): void {
    startMeasure('localeChange');
    this.locale = this.locale === 'en' ? 'de' : 'en';
    stopMeasure('localeChange');
  }
  public toggleAddressDetails(): void {
    startMeasure('toggleAddressDetails');
    this.showAddressDetails = !this.showAddressDetails;
    stopMeasure('toggleAddressDetails');
  }

  // public run() {
  //   startMeasure("run");
  //   this.store.run();
  //   stopMeasure();
  // }
  // public add() {
  //   startMeasure("add");
  //   this.store.add();
  //   stopMeasure();
  // }
  // public remove(item: { id: any }) {
  //   startMeasure("delete");
  //   this.store.delete(item.id);
  //   stopMeasure();
  // }
  // public select(item: { id: any }) {
  //   startMeasure("select");
  //   this.store.select(item.id);
  //   stopMeasure();
  // }
  // public update() {
  //   startMeasure("update");
  //   this.store.update();
  //   stopMeasure();
  // }

  // public runLots() {
  //   startMeasure("runLots");
  //   this.store.runLots();
  //   stopMeasure();
  // }

  // public clear() {
  //   startMeasure("clear");
  //   this.store.clear();
  //   stopMeasure();
  // }

  // public swapRows() {
  //   startMeasure("swapRows");
  //   this.store.swapRows();
  //   stopMeasure();
  // }
}

@valueConverter('formatDate')
export class FormatDate {
  private static formatters: Record<string, Intl.DateTimeFormat> = Object.create(null);

  public toView(value: Date, locale: string = 'en') {
    const formatter = FormatDate.formatters[locale]
      ?? (FormatDate.formatters[locale] = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }));
    return formatter.format(value);
  }
}
