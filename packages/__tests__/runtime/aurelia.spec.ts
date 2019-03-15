import { expect } from 'chai';
import { spy } from 'sinon';
import { Aurelia, State } from '@aurelia/runtime';
import { AuDOMConfiguration } from './au-dom';

describe('Aurelia', function () {
  let sut: Aurelia;

  beforeEach(function () {
    sut = new Aurelia(AuDOMConfiguration.createContainer());
  });

  it('should initialize container directly', function () {
    expect(sut['container'].get(Aurelia)).to.equal(sut);
  });

  it('should initialize correctly', function () {
    expect(sut['components'].length).to.equal(0);
    expect(sut['startTasks'].length).to.equal(0);
    expect(sut['stopTasks'].length).to.equal(0);
    expect(sut['isStarted']).to.equal(false);
    expect(sut['container']).not.to.equal(undefined);
  });

  it('should register dependencies', function () {
    spy(sut['container'], 'register');
    class Foo {}
    class Bar {}
    sut.register(Foo as any, Bar as any);

    expect(sut['container'].register).to.have.been.calledWith(Foo, Bar);
  });

  it('should register dependencies as array', function () {
    spy(sut['container'], 'register');
    class Foo {}
    class Bar {}
    sut.register([Foo, Bar] as any);

    expect(sut['container'].register).to.have.been.calledWith([Foo, Bar]);
  });

  it('should register start and stop task', function () {
    sut.app({component: {}, host: {}});

    expect(sut['startTasks'].length).to.equal(1);
    expect(sut['stopTasks'].length).to.equal(1);
  });

  it('should start', function () {
    let hydrated = false;
    let bound = false;
    let attached = false;
    sut.app({component: {
      $hydrate() { hydrated = true; },
      $bind() { bound = true; },
      $attach() { attached = true; }
    }, host: {}});

    sut.start();

    expect(sut['isStarted']).to.equal(true);
    expect(hydrated).to.equal(true);
    expect(bound).to.equal(true);
    expect(attached).to.equal(true);
  });

  it('should stop', function () {
    let unbound = false;
    let detached = false;

    sut.app({component: {
      $state: State.isAttached,
      $unbind() { unbound = true; },
      $detach() { detached = true; }
    }, host: {}});

    sut.stop();

    expect(sut['isStarted']).to.equal(false);
    expect(detached).to.equal(true);
    expect(unbound).to.equal(true);
  });
});
