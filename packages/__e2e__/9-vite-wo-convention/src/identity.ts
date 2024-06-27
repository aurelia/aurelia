import { valueConverter } from 'aurelia';

@valueConverter('identity')
export class IdentityValueConverter {
  toView(v: unknown) { return v; }
}
