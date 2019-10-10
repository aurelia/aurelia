import * as faker from 'faker';
import './app.scss'; // eslint-disable-line import/no-unassigned-import
import { customElement, IController } from '@aurelia/runtime';
import template from './app.html';

function createItem() {
  return {
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    country: faker.address.country()
  };
}

type Column = { name: string; title: string };
type Row = { name: string; phone: string; country: string };

function compare(a: Row, b: Row, key: keyof Row): number {
  if (a[key] < b[key]) {
    return -1;
  } else if (a[key] > b[key]) {
    return 1;
  } else {
    return 0;
  }
}

@customElement({ name: 'app', template })
export class App {
  public rows: Row[];
  public cols: Column[];

  public $controller: IController<Node>;

  private sortCol?: string;

  public constructor() {
    this.rows = [];
    this.cols = [
      {
        title: 'Name',
        name: 'name',
      },
      {
        title: 'Phone',
        name: 'phone',
      },
      {
        title: 'Country',
        name: 'country',
      },
    ];

    this.sortCol = void 0;
  }

  public create(count: number): void {
    this.$controller.lifecycle.batch.inline(() => {
      for (let i = 0; i < count; ++i) {
        this.rows.push(createItem());
      }
    });
  }

  public remove(count?: number): void {
    if (count === void 0 || count >= this.rows.length) {
      this.rows = [];
    } else {
      this.rows.splice(this.rows.length - count, count);
    }
  }

  public sort(colName: keyof Row): void {
    if (this.sortCol === colName) {
      this.rows.reverse();
    } else {
      this.sortCol = colName;
      this.rows.sort((a, b) => compare(a, b, colName));
    }
  }
}
