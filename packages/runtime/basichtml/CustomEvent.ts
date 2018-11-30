import { Event} from './Event';

export interface ICustomEventInitOptions<T = any> {
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
  detail: T
}

// interface CustomEvent // https://dom.spec.whatwg.org/#customevent
export class CustomEvent<T = any> extends Event {

  detail: T;

  constructor(type: string, eventInitDict: ICustomEventInitOptions<T> = {
    bubbles: false,
    cancelable: false,
    composed: false,
    detail: null
  }) {
    super(type, eventInitDict);
    this.detail = eventInitDict.detail;
  }
};
