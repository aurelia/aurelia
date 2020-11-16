import { DI } from '@aurelia/kernel';
import { AddressRepository, Database, IAddressRepository, IPersonRepository, PersonRepository } from '@benchmarking-apps/shared';

const db = new Database();
export const ipr = DI.createInterface<IPersonRepository>('IPersonRepository')
  .withDefault((container) => container.instance(new PersonRepository(db)));
export const iar = DI.createInterface<IAddressRepository>('IAddressRepository')
  .withDefault((container) => container.instance(new AddressRepository(db)));
