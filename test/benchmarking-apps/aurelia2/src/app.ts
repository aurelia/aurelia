import { computed, customElement, valueConverter } from '@aurelia/runtime-html';
import { IAddressRepository, IPersonRepository, Person } from '@benchmarking-apps/shared';
import template from './app.html';
import { iar, ipr } from './registrations';

// Can we do better? Or this needs to be here for other Fx compat?
// let startTime: number;
// let lastMeasure: string;
const startMeasure = function (name: string) {
  console.time(name);
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

enum SortingDirection {
  Ascending = 0,
  Descending = 1,
}
class SortingOptions<TObject> {
  private _direction: SortingDirection = SortingDirection.Ascending;
  public constructor(
    public readonly property: keyof TObject,
  ) { }
  @computed({ static: true })
  public get direction(): SortingDirection {
    return this._direction;
  }
  public toggleDirection() {
    this._direction = 1 - this._direction;
  }
  public toString() {
    return `${this.property.toString()} - ${this._direction === SortingDirection.Ascending ? 'asc' : 'desc'}`;
  }
}

@customElement({ name: 'app', template })
export class App {
  private people: Person[];
  private locale: string = 'en';
  private showAddressDetails: boolean = false;
  private currentSorting: SortingOptions<Person> | null = null;
  private employmentStatus: 'employed' | 'unemployed' | undefined = void 0;
  public constructor(
    @ipr private readonly personRepository: IPersonRepository,
    @iar private readonly addressRepository: IAddressRepository,
  ) {
    this.people = personRepository.all();
  }

  public changeLocale(): void {
    // change in a single binding
    startMeasure('localeChange');
    this.locale = this.locale === 'en' ? 'de' : 'en';
    stopMeasure('localeChange');
  }

  public toggleAddressDetails(): void {
    // de/activates more bindings
    startMeasure('toggleAddressDetails');
    this.showAddressDetails = !this.showAddressDetails;
    stopMeasure('toggleAddressDetails');
  }

  public filterEmployed(status: 'employed' | 'unemployed' | undefined): void {
    if (this.employmentStatus === status) { return; }
    const label = `filter - ${status ?? 'all'}`;
    // filter/subset
    startMeasure(label);
    this.employmentStatus = status;
    stopMeasure(label);
  }

  public applySorting(property: keyof Person): void {
    // this is bench artifact; in a real app, this will go to the repository/service.
    const label = `sorting - ${property}`;
    startMeasure(label);
    let sortingOption = this.currentSorting;
    if (sortingOption === null || sortingOption.property !== property) {
      sortingOption = this.currentSorting = new SortingOptions(property);
    } else {
      sortingOption.toggleDirection();
    }
    const people = this.people;
    const value = this.people[0][property];
    const direction = sortingOption.direction === SortingDirection.Ascending ? 1 : -1;
    switch (true) {
      case typeof value === 'string':
        people.sort((p1, p2) => direction * (p1[property] as string).localeCompare(p2[property] as string));
        break;
      case value instanceof Date:
        people.sort((p1, p2) => direction * ((p1[property] as Date).getTime() - (p2[property] as Date).getTime()));
        break;
    }
    stopMeasure(label);
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private static formatters: Record<string, Intl.DateTimeFormat> = Object.create(null);

  public toView(value: Date, locale: string = 'en'): string {
    const formatter = FormatDate.formatters[locale]
      ?? (FormatDate.formatters[locale] = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }));
    return formatter.format(value);
  }
}

@valueConverter('filterEmployed')
export class FilterEmployed {
  public toView(value: Person[], status?: 'employed' | 'unemployed'): Person[] {
    if (status == null) { return value; }
    const predicate = status === 'employed'
      ? (p: Person) => p.jobTitle !== void 0
      : (p: Person) => p.jobTitle === void 0;
    return value.filter(predicate);
  }
}
