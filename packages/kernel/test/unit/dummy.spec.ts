import { expect } from 'chai';
import { DI } from '../../src/di';

describe('configure', () => {
  it('should be defined', () => {
    expect(DI).not.to.be.undefined;
  });
});
