import { Registration } from '@aurelia/kernel';
import { expect } from 'chai';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
import { CustomElementResource } from '../../../runtime/src/index';
import { Router, Viewport } from '../../src/index';
import { registerComponent } from './utils';

const define = (CustomElementResource as any).define;

describe('Viewport', () => {
  it('can be created', () => {
    const sut = new Viewport(null, null, null, null, null, null);
  });
});
