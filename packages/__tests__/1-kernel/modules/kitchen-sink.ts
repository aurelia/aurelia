import { IContainer } from '@aurelia/kernel';
import { valueConverter, bindingBehavior } from '@aurelia/runtime';
import { customElement, customAttribute } from '@aurelia/runtime-html';

@customElement({ name: 'ce' })
export class CE {}

@customAttribute({ name: 'ca' })
export class CA {}

@valueConverter({ name: 'vc' })
export class VC {}

@bindingBehavior({ name: 'bb' })
export class BB {}

export class X {}

export const $null = null;
export const $undefined = undefined;
export const $1 = 1;
export const $true = true;
export const $false = false;

export const Registry = {
  register(container: IContainer): void {
    container.register(CE, CA, VC, BB);
  },
};
