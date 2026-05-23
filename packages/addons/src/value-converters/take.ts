import { valueConverter } from '@aurelia/runtime-html';

@valueConverter('take')
export class TakeValueConverter {
  public toView(value?: unknown[], amount?: number) {
    return value?.slice(0, amount ?? 0);
  }
}
