import { expect } from 'chai';
import { Toggle } from '@aurelia/kernel';

describe('A Toggle', () => {
  it('should be disabled by default', () => {
    const sut = new Toggle();

    expect(sut.isDisabled).to.be.true;
    expect(sut.isEnabled).to.be.false;
  });

  it('should become enabled upon request', () => {
    const sut = new Toggle();

    sut.enable();

    expect(sut.isDisabled).to.be.false;
    expect(sut.isEnabled).to.be.true;
  });

  it('should become disabled upon request', () => {
    const sut = new Toggle();

    sut.enable();
    expect(sut.isDisabled).to.be.false;

    sut.disable();
    expect(sut.isDisabled).to.be.true;
    expect(sut.isEnabled).to.be.false;
  });
});
