import { bindable, ICustomElement, ICustomElementType } from '../../../src/index';
import { expect } from 'chai';
import { spy } from 'sinon';
import { Reporter } from '../../../../kernel/src';

describe('addHyphenAndLower', () => {

});

describe('@bindable', () => {

  it('understands alias', () => {
    class Test {
      @bindable({ attribute: 'notprop' }) isProp: any
    }

    expect((Test as any).bindables['notprop']).not.to.be.undefined;
  });

  it('kebabs alias', () => {
    const errorSpy = spy(Reporter, 'error');
    class Test {
      @bindable({ attribute: 'notProp' }) isProp: any
    }

    expect((Test as any).bindables['not-prop']).not.to.be.undefined;
    expect(errorSpy).to.have.been.calledWith(100, 'notProp');
  });
});
