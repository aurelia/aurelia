import { __decorate, __param } from "tslib";
import { DI, IEventAggregator, PLATFORM } from '@aurelia/kernel';
import { ISignaler, PromiseTask } from '@aurelia/runtime';
import { I18nInitOptions } from './i18n-configuration-options';
import { I18nWrapper } from './i18next-wrapper';
var TimeSpan;
(function (TimeSpan) {
    TimeSpan[TimeSpan["Second"] = 1000] = "Second";
    TimeSpan[TimeSpan["Minute"] = 60000] = "Minute";
    TimeSpan[TimeSpan["Hour"] = 3600000] = "Hour";
    TimeSpan[TimeSpan["Day"] = 86400000] = "Day";
    TimeSpan[TimeSpan["Week"] = 604800000] = "Week";
    TimeSpan[TimeSpan["Month"] = 2592000000] = "Month";
    TimeSpan[TimeSpan["Year"] = 31536000000] = "Year";
})(TimeSpan || (TimeSpan = {}));
export class I18nKeyEvaluationResult {
    constructor(keyExpr) {
        this.value = (void 0);
        const re = /\[([a-z\-, ]*)\]/ig;
        this.attributes = [];
        // check if a attribute was specified in the key
        const matches = re.exec(keyExpr);
        if (matches) {
            keyExpr = keyExpr.replace(matches[0], '');
            this.attributes = matches[1].split(',');
        }
        this.key = keyExpr;
    }
}
export const I18N = DI.createInterface('I18N').noDefault();
/**
 * Translation service class.
 */
let I18nService = class I18nService {
    constructor(i18nextWrapper, options, ea, signaler) {
        this.ea = ea;
        this.signaler = signaler;
        this.i18next = i18nextWrapper.i18next;
        this.task = new PromiseTask(this.initializeI18next(options), null, this);
        this.intl = PLATFORM.global.Intl;
    }
    evaluate(keyExpr, options) {
        const parts = keyExpr.split(';');
        const results = [];
        for (const part of parts) {
            const result = new I18nKeyEvaluationResult(part);
            const key = result.key;
            const translation = this.tr(key, options);
            if (this.options.skipTranslationOnMissingKey && translation === key) {
                // TODO change this once the logging infra is there.
                console.warn(`Couldn't find translation for key: ${key}`);
            }
            else {
                result.value = translation;
                results.push(result);
            }
        }
        return results;
    }
    tr(key, options) {
        return this.i18next.t(key, options);
    }
    getLocale() {
        return this.i18next.language;
    }
    async setLocale(newLocale) {
        const oldLocale = this.getLocale();
        await this.i18next.changeLanguage(newLocale);
        this.ea.publish("i18n:locale:changed" /* I18N_EA_CHANNEL */, { oldLocale, newLocale });
        this.signaler.dispatchSignal("aurelia-translation-signal" /* I18N_SIGNAL */);
    }
    createNumberFormat(options, locales) {
        return this.intl.NumberFormat(locales || this.getLocale(), options);
    }
    nf(input, options, locales) {
        return this.createNumberFormat(options, locales).format(input);
    }
    createDateTimeFormat(options, locales) {
        return this.intl.DateTimeFormat(locales || this.getLocale(), options);
    }
    df(input, options, locales) {
        return this.createDateTimeFormat(options, locales).format(input);
    }
    uf(numberLike, locale) {
        // Unfortunately the Intl specs does not specify a way to get the thousand and decimal separators for a given locale.
        // Only straightforward way would be to include the CLDR data and query for the separators, which certainly is a overkill.
        const comparer = this.nf(10000 / 3, undefined, locale);
        let thousandSeparator = comparer[1];
        const decimalSeparator = comparer[5];
        if (thousandSeparator === '.') {
            thousandSeparator = '\\.';
        }
        // remove all thousand separators
        const result = numberLike.replace(new RegExp(thousandSeparator, 'g'), '')
            // remove non-numeric signs except -> , .
            .replace(/[^\d.,-]/g, '')
            // replace original decimalSeparator with english one
            .replace(decimalSeparator, '.');
        // return real number
        return Number(result);
    }
    createRelativeTimeFormat(options, locales) {
        return new this.intl.RelativeTimeFormat(locales || this.getLocale(), options);
    }
    rt(input, options, locales) {
        let difference = input.getTime() - new Date().getTime();
        const epsilon = this.options.rtEpsilon * (difference > 0 ? 1 : 0);
        const formatter = this.createRelativeTimeFormat(options, locales);
        let value = difference / 31536000000 /* Year */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'year');
        }
        value = difference / 2592000000 /* Month */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'month');
        }
        value = difference / 604800000 /* Week */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'week');
        }
        value = difference / 86400000 /* Day */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'day');
        }
        value = difference / 3600000 /* Hour */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'hour');
        }
        value = difference / 60000 /* Minute */;
        if (Math.abs(value + epsilon) >= 1) {
            return formatter.format(Math.round(value), 'minute');
        }
        difference = Math.abs(difference) < 1000 /* Second */ ? 1000 /* Second */ : difference;
        value = difference / 1000 /* Second */;
        return formatter.format(Math.round(value), 'second');
    }
    async initializeI18next(options) {
        const defaultOptions = {
            lng: 'en',
            fallbackLng: ['en'],
            debug: false,
            plugins: [],
            rtEpsilon: 0.01,
            skipTranslationOnMissingKey: false,
        };
        this.options = { ...defaultOptions, ...options };
        for (const plugin of this.options.plugins) {
            this.i18next.use(plugin);
        }
        await this.i18next.init(this.options);
    }
};
I18nService = __decorate([
    __param(0, I18nWrapper),
    __param(1, I18nInitOptions),
    __param(2, IEventAggregator),
    __param(3, ISignaler)
], I18nService);
export { I18nService };
//# sourceMappingURL=i18n.js.map