import { DI } from '@aurelia/kernel';
import {
  IAddressRepository,
  IPersonRepository,
} from '@benchmarking-apps/shared';

export const ipr = DI.createInterface<IPersonRepository>('IPersonRepository');
export const iar = DI.createInterface<IAddressRepository>('IAddressRepository');
