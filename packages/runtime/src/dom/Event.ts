const getTime = () => {
  const time = performance.now();
  return time[0] * 1000000 + time[1] / 1000;
};

export interface EventInitDict {
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
}

const defaultEventInitDict: EventInitDict = {
  bubbles: false,
  cancelable: false,
  composed: false
};

// interface Event // https://dom.spec.whatwg.org/#event
export class Event {

  static readonly NONE = 0;
  static readonly CAPTURING_PHASE = 1;
  static readonly AT_TARGET = 2;
  static readonly BUBBLING_PHASE = 3;

  type: string;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  cancelBubble: boolean;
  cancelImmediateBubble: boolean;
  eventPhase: 0 | 1 | 2 | 3;
  isTrusted: boolean;
  composed: boolean;
  timeStamp: number;

  target: any;
  currentTarget: any;

  constructor(type?: string, eventInitDict: EventInitDict = defaultEventInitDict) {
    if (type) {
      this.initEvent(
        type,
        eventInitDict.bubbles,
        eventInitDict.cancelable
      );
    }
    this.composed = eventInitDict.composed;
    this.isTrusted = false;
    this.defaultPrevented = false;
    this.cancelBubble = false;
    this.cancelImmediateBubble = false;
    this.eventPhase = Event.NONE;
    this.timeStamp = getTime();
  }

  initEvent(type: string, bubbles: boolean, cancelable: boolean) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
  }

  stopPropagation() {
    this.cancelBubble = true;
  }

  stopImmediatePropagation() {
    this.cancelBubble = true;
    this.cancelImmediateBubble = true;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}
