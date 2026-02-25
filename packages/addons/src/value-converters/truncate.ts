import { valueConverter } from 'aurelia';

@valueConverter('truncate')
export class TruncateValueConverter {
    toView(value:unknown, maxLength = 10) {
        if (!value || typeof value !== 'string') return '';
        if (value.length <= maxLength) return value;
        return `${value.substring(0, maxLength)}...`;
    }
}