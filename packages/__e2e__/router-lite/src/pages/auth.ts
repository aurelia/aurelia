import { defineElement } from '@aurelia/runtime-html';
import template from './auth.html';

export class Auth {}
defineElement({ name: 'auth', template }, Auth);

// https://github.com/aurelia/aurelia/issues/1530
export class Foo1530 { }
