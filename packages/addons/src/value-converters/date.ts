import { valueConverter } from 'aurelia';

@valueConverter('date')
export class DateValueConverter {
    toView(value:Date|string|undefined|null, format:Intl.DateTimeFormatOptions) {
        if (!value) return '';
        return new Date(value).toLocaleDateString(undefined, {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ...format
        });
    }
}