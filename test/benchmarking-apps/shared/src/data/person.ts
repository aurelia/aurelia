import { AddressAssociation } from './address';
import { IEntity } from '../contracts';
import { randomBoolean, randomDate, randomFirstName, randomJobs, randomLastName, randomNumber } from './random-generator';
import { Writable } from '../utils';
import { BaseRepository } from '../repository';
import { Database } from '../database';

export class Person implements IEntity {
  public selected: boolean = false;
  public readonly addresses: AddressAssociation[] = [];
  public constructor(
    public firstName: string = randomFirstName(),
    public lastName: string = randomLastName(),
    public dob: Date = randomDate(),
    public jobTitle: string | undefined = randomBoolean() ? randomJobs() : void 0,
    public readonly id = randomNumber(),
  ) { }

  public clone(): Person {
    const person = new Person(
      /* firstName  */this.firstName,
      /* lastName   */this.lastName,
      /* dob        */this.dob,
      /* jobTitle   */this.jobTitle,
      /* id         */this.id,
    );
    (person as Writable<Person>).addresses = this.addresses.map((a) => a.clone());
    return person;
  }
}

export interface IPersonRepository extends PersonRepository { }
export class PersonRepository extends BaseRepository<Person> {
  public constructor(
    database: Database,
    private readonly maxAddresses: number = 3, // Do we need this as some sort of config option? Probably not.
  ) {
    super(database, (d) => d.people);
    this.associateRandomAddresses();
  }

  public createRandom(): Person {
    const person = new Person();
    this.associateRandomAddresses(person);
    return person;
  }

  public createNewTill(n: number): void {
    const currentLength = this.collection.length;
    const delta = n - currentLength;
    if (delta > 0) {
      const newArr = new Array(delta);
      for (let i = 0; i < delta; i++) {
        newArr[i] = this.createRandom();
      }
      this.collection.push(...newArr);
    }
  }

  public updateEvery10th(): void {
    const data = this.collection;
    const len = data.length;
    for (let i = 0; i < len; i += 10) {
      data[i].firstName += ' !!!';
    }
  }

  private associateRandomAddresses(person?: Person) {
    const maxAddresses: number = this.maxAddresses;
    if (person !== void 0) {
      const n = randomNumber(maxAddresses, 1);
      person.addresses.push(...this.createNAddressAssociation(n));
      return;
    }

    for (const $person of this.database.people) {
      const n = randomNumber(maxAddresses, 1);
      $person.addresses.push(...this.createNAddressAssociation(n));
    }
  }

  private createNAddressAssociation(n: number) {
    const ret = new Array<AddressAssociation>(n);
    const db = this.database;
    for (let i = 0; i < n; i++) {
      ret[i] = AddressAssociation.create(db.getRandomAddress());
    }
    return ret;
  }
}
