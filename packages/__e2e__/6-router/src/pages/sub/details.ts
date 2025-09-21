import { containerless } from 'aurelia';

@containerless
export class Details {
  id: string;

  canLoad(params) {
    this.id = params.id;
    return true;
  }
}
