import { bindable, inject } from 'aurelia';
import { ServiceB } from '../services';

@inject(ServiceB)
export class MyInput {
    @bindable value = '';
    public constructor(private readonly b: ServiceB) {}
}
