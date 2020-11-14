import { AddressAssociation } from './address';
import { IEntity } from '../contracts';
import { randomBoolean, randomDate, randomFirstName, randomLastName, randomNumber } from './random-generator';
import { Writable } from '../utils';
import { BaseRepository } from '../repository';
import { Database } from '../database';

export class Person implements IEntity {
  public readonly addresses: AddressAssociation[] = [];
  public constructor(
    public firstName: string = randomFirstName(),
    public lastName: string = randomLastName(),
    public dob: Date = randomDate(),
    public isDeceased: boolean = randomBoolean(),
    public readonly id = randomNumber(),
  ) { }

  public clone(): Person {
    const person = new Person(
      /* firstName  */this.firstName,
      /* lastName   */this.lastName,
      /* dob        */this.dob,
      /* isDeceased */this.isDeceased,
      /* id         */this.id,
    );
    (person as Writable<Person>).addresses = this.addresses.map((a) => a.clone());
    return person;
  }
}

export class PersonRepository extends BaseRepository<Person> {
  public constructor(database: Database) {
    super(database, (d) => d.people);
  }
  public createRandom(): Person {
    return new Person();
  }
}
