import { DI, PLATFORM } from '@aurelia/kernel';
const defaultNow = PLATFORM.now.bind(PLATFORM);
export const Now = DI.createInterface('Now').withDefault(x => x.instance(defaultNow));
//# sourceMappingURL=now.js.map