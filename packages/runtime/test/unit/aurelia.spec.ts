import { Aurelia } from '../../src/index';
import { expect } from 'chai';
import { spy } from 'sinon';

describe('Aurelia', () => {
  let sut: Aurelia;

  beforeEach(() => {
    sut = new Aurelia();
  });

  it('should initialize container directly', () => {
    expect(sut['container'].get(Aurelia)).to.equal(sut);
  });

  it('should initialize correctly', () => {
    expect(sut['components'].length).to.equal(0);
    expect(sut['startTasks'].length).to.equal(0);
    expect(sut['stopTasks'].length).to.equal(0);
    expect(sut['isStarted']).to.be.false;
    expect(sut['container']).not.to.be.undefined;
  });

  it('should register dependencies', () => {
    spy(sut['container'], 'register');
    class Foo{}
    class Bar{}
    sut.register(<any>Foo, <any>Bar);

    expect(sut['container'].register).to.have.been.calledWith(Foo, Bar);
  });

  it('should register dependencies as array', () => {
    spy(sut['container'], 'register');
    class Foo{}
    class Bar{}
    sut.register(<any>[Foo, Bar]);

    expect(sut['container'].register).to.have.been.calledWith([Foo, Bar]);
  });

  it('should register start and stop task', () => {
    sut.app({component: {}, host: {}});

    expect(sut['startTasks'].length).to.equal(1);
    expect(sut['stopTasks'].length).to.equal(1);
  });

  it('should start', () => {
    let hydrated = false;
    let bound = false;
    let attached = false;
    sut.app({component: {
      $hydrate() { hydrated = true; },
      $bind() { bound = true; },
      $attach() { attached = true; }
    }, host: {}});

    sut.start();

    expect(sut['isStarted']).to.be.true;
    expect(hydrated).to.be.true;
    expect(bound).to.be.true;
    expect(attached).to.be.true;
  });

  it('should stop', () => {
    let unbound = false;
    let detached = false;

    sut.app({component: {
      $isAttached: true,
      $unbind() { unbound = true; },
      $detach() { detached = true; }
    }, host: {}});

    sut.stop();

    expect(sut['isStarted']).to.be.false;
    expect(detached).to.be.true;
    expect(unbound).to.be.true;
  });
});
