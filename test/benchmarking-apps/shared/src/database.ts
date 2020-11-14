import { Address } from './data/address';
import { Person } from './data/person';
import { Writable } from './utils';

export class Database {
  public readonly addresses!: Address[];
  public readonly people!: Person[];

  public constructor(skipSeed: boolean = false) {
    if (skipSeed) {
      this.addresses = [];
      this.people = [];
    } else {
      this.seed();
    }
  }

  private seed() {
    // TODO: probably move this to package configuration option
    const numAddresses = 100;
    const numPeople = 200;

    const addresses = (this as Writable<this>).addresses = new Array<Address>(numAddresses);
    const people = (this as Writable<this>).people = new Array<Person>(numPeople);

    for (let i = 0; i < numAddresses; i++) {
      addresses[i] = new Address();
    }
    for (let i = 0; i < numPeople; i++) {
      people[i] = new Person();
    }
  }
}
