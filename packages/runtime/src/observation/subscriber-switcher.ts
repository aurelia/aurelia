import { IConnectableBinding } from '../binding/connectable';

/**
 * Current subscription collector
 */
let $collector: IConnectableBinding | null = null;
const collectors: IConnectableBinding[] = [];
const collectingStatus: boolean[] = [];

export let collecting = false;

// todo: layer based collection pause/resume?
export function pauseSubscription() {
  collecting = false;
}

export function resumeSubscription() {
  collecting = true;
}

export function currentSub(): IConnectableBinding | null {
  return $collector;
}

export function enterSub(subscriber: IConnectableBinding): void {
  if ($collector == null) {
    collectors[0] = $collector = subscriber;
    return;
  }
  if ($collector === subscriber) {
    throw new Error('Already in this subscriber {subscriber.id}');
  }
  collectors.push($collector = subscriber);
  collecting = true;
}

export function exitSub(subscriber: IConnectableBinding): void {
  if ($collector == null || $collector !== subscriber) {
    throw new Error('${subscriber.id} is not currently collecting');
  }

  collectors.pop();
  $collector = collectors.length > 0 ? collectors[collectors.length - 1] : null;
  collecting = $collector != null;
}

// export const DepCollectorSwitcher = Object.freeze({
//   getCurrentSubscriber: currentSub,
//   enterSubscriber: enterSub,
//   exitSubscriber: exitSub,
//   pauseSubscription,
//   resumeSubscription,
// });