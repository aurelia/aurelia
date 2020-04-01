import { DI } from '@aurelia/kernel';

const defaultNow = Date.now.bind(Date);

export const Now = DI.createInterface<Now>('Now').withDefault(x => x.instance(defaultNow));
export type Now = () => number;
