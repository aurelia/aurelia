import { IEntity } from '../contracts';
import { Database } from '../database';
import { BaseRepository } from '../repository';
import { randomStreet, randomNumber, randomPin, randomCity, randomCountry } from "./random-generator";

export const enum AddressType {
  residence = 0b001,
  work = 0b010,
  postal = 0b100
}

export class Address implements IEntity {
  public selected: boolean = false;
  public constructor(
    public street: string = randomStreet(),
    public houseNumber: number = randomNumber(),
    public pin: string = randomPin(),
    public city: string = randomCity(),
    public country: string = randomCountry(),
    public readonly id = randomNumber(),
  ) { }
  public clone(): Address {
    return new Address(
      /* street       */this.street,
      /* houseNumber  */this.houseNumber,
      /* pin          */this.pin,
      /* city         */this.city,
      /* country      */this.country,
      /* id           */this.id,
    );
  }
}

export class AddressAssociation implements IEntity {
  public selected: boolean = false;
  public constructor(
    public address: Address,
    public type: AddressType,
    public readonly id = randomNumber(),
  ) { }

  public clone(): AddressAssociation {
    return new AddressAssociation(
      /* address  */this.address.clone(),
      /* type     */this.type,
      /* id       */this.id,
    );
  }

  private static readonly types = [AddressType.residence, AddressType.work, AddressType.postal];
  private static getRandomType() {
    const types = this.types;
    const len = types.length;
    const mixN = randomNumber(len, 1);
    let type: AddressType = 0;
    for (let i = 0; i < mixN; i++) {
      type |= types[Math.floor(Math.random() * len)];
    }
    return type;
  }
  public static create(address: Address, type?: AddressType): AddressAssociation {
    return new AddressAssociation(
      address,
      type ?? this.getRandomType()
    );
  }
}

export interface IAddressRepository extends AddressRepository { }
export class AddressRepository extends BaseRepository<Address> {
  public constructor(database: Database) {
    super(database, (d) => d.addresses);
  }
  public createRandom(): Address {
    return new Address();
  }
}
