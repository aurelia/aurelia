import { customElement } from '@aurelia/runtime';

export interface IOption {
  value: number;
  text: string;
}

@customElement({
  name: 'app',
  template: require('./app.html'),
})
export class App {
  public options: IOption[] = [
    { value: 0, text: 'zero'  },
    { value: 1, text: 'one'   },
    { value: 2, text: 'two'   },
    { value: 3, text: 'three' },
    { value: 4, text: 'four'  },
    { value: 5, text: 'five'  },
    { value: 6, text: 'six'   },
    { value: 7, text: 'seven' },
    { value: 8, text: 'eight' },
    { value: 9, text: 'nine'  }
  ];
}
