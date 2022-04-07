import { customElement, valueConverter } from '@aurelia/runtime-html';
import { IPersonRepository, Person } from '@benchmarking-apps/shared';
import template from './app.html';
import { ipr } from './registrations';

enum SortingDirection {
  Ascending = 0,
  Descending = 1,
}
class SortingOptions<TObject> {
  private _direction: SortingDirection = SortingDirection.Ascending;
  public constructor(
    public readonly property: keyof TObject,
  ) { }
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
  ) {
    this.people = personRepository.all();
  }

  public changeLocale(): void {
    // change in a single binding
    const newLocale = this.locale === 'en' ? 'de' : 'en';
    this.locale = newLocale;
  }

  public toggleAddressDetails(): void {
    // de/activates more bindings
    const newValue = !this.showAddressDetails;
    this.showAddressDetails = newValue;
  }

  public filterEmployed(status: 'employed' | 'unemployed' | undefined): void {
    if (this.employmentStatus === status) { return; }
    // filter/subset
    this.employmentStatus = status;
  }

  public applySorting(property: keyof Person): void {
    // this is bench artifact; in a real app, this will go to the repository/service.
    // startMeasure(label);
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
  }

  public haveN(n: number): void {
    this.personRepository.createNewTill(n);
  }

  public plusN(n: number): void {
    this.personRepository.createNewTill(this.people.length + n);
  }

  public removeAll(): void {
    const repository = this.personRepository;
    repository.removeAll();
    this.people = repository.all();
  }

  public delete(index: number): void {
    this.personRepository.deleteByIndex(index);
  }

  public select(index: number): void {
    this.personRepository.select(index);
  }

  public updateEvery10th(): void {
    this.personRepository.updateEvery10th();
  }

  public swapRows(): void {
    const data = this.people;
    if (data.length > 998) {
      const temp = data[1];
      const temp2 = data[998];
      // TODO(bigopon): add batch back in
      // this.lifecycle.batch.inline(() => {
      data.splice(1, 1, temp2);
      data.splice(998, 1, temp);
      // });
    }
  }
}

@valueConverter('formatDate')
export class FormatDate {
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
    if (status == null || ((value?.length ?? 0) === 0)) { return value; }
    const predicate = status === 'employed'
      ? (p: Person) => p.jobTitle !== void 0
      : (p: Person) => p.jobTitle === void 0;
    return value.filter(predicate);
  }
}
