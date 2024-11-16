import { bindable, inject } from 'aurelia';
import { ServiceB } from '../services';

@inject(ServiceB)
export class MyInput {
    @bindable value = '';
    public constructor(public readonly b: ServiceB) {} /** TODO: make this private, when the type-checking infra can correctly handle private properties. */
}
