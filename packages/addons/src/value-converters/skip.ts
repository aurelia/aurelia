import { valueConverter } from '@aurelia/runtime-html';

@valueConverter('skip')
export class SkipValueConverter {
  public toView(value?: unknown[], amount?: number) {
    return value?.slice(amount ?? 0);
  }
}
