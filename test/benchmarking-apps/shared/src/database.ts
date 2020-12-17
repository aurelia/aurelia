import { Address } from './data/address';
import { Person } from './data/person';
import { randomNumber } from './data/random-generator';
import { Writable } from './utils';

export class Database {
  public readonly addresses!: Address[];
  public readonly people!: Person[];

  public constructor(numPeople?: number, skipSeed: boolean = false) {
    if (skipSeed) {
      this.addresses = [];
      this.people = [];
    } else {
      this.seed(numPeople);
    }
  }

  private seed(numPeople = 0) {
    // TODO: probably move this to package configuration option
    const numAddresses = 100;

    const addresses = (this as Writable<this>).addresses = new Array<Address>(numAddresses);
    const people = (this as Writable<this>).people = new Array<Person>(numPeople);

    for (let i = 0; i < numAddresses; i++) {
      addresses[i] = new Address();
    }
    for (let i = 0; i < numPeople; i++) {
      people[i] = new Person();
    }
  }

  public getRandomAddress(): Address {
    const addresses = this.addresses;
    return addresses[randomNumber(addresses.length)];
  }
}
