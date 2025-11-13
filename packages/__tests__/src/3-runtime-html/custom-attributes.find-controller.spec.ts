import { resolve } from '@aurelia/kernel';
import {
  closestAttribute,
  CustomAttribute,
  INode
} from '@aurelia/runtime-html';
import { createFixture, assert } from '@aurelia/testing';

describe('3-runtime-html/custom-attributes.find-controller.spec.ts', function () {
  it('finds attribute controller from child custom element', function () {
    let myAttr: any = null;
    createFixture(
      `<div my-attr>
        <my-el></my-el>
      </div>`,
      class {},
      [
        class MyAttr {
          static $au = {
            name: 'my-attr',
            type: 'custom-attribute',
          };
        },
        class MyEl {
          static $au = {
            name: 'my-el',
            type: 'custom-element',
          };

          constructor() {
            myAttr = CustomAttribute.closest(resolve(INode), 'my-attr');
          }
        }
      ],

    );

    assert.notEqual(myAttr, null);
  });

  it('finds attribute controller from child attribute', function () {
    let myAttr: any = null;
    createFixture(
      `<div my-attr>
        <div my-child-attr></div>
      </div>`,
      class {},
      [
        class MyAttr {
          static $au = {
            name: 'my-attr',
            type: 'custom-attribute',
          };
        },
        class MyChildAttr {
          static $au = {
            name: 'my-child-attr',
            type: 'custom-attribute',
          };

          constructor() {
            myAttr = CustomAttribute.closest(resolve(INode), 'my-attr');
          }
        }
      ],

    );

    assert.notEqual(myAttr, null);
  });
});
