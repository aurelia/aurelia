import { DI } from '../../../kernel/dist/native-modules/index.js';
import i18next from 'i18next';
export const I18nWrapper = DI.createInterface('I18nextWrapper');
/**
 * A wrapper class over i18next to facilitate the easy testing and DI.
 */
export class I18nextWrapper {
    constructor() {
        this.i18next = i18next;
    }
}
//# sourceMappingURL=i18next-wrapper.js.map