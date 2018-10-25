import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { LifecycleState } from "../src";


chai.should();
chai.use(sinonChai);
chai.use(function(_chai, utils) {
  const Assertion = _chai['Assertion'];

  Assertion.addProperty('$state');
  function getStateFlagName(state) {
    if (state === 0) return 'none';
    let names = [];
    if (state & LifecycleState.isBinding) names.push('isBinding');
    if (state & LifecycleState.isBound) names.push('isBound');
    if (state & LifecycleState.isAttaching) names.push('isAttaching');
    if (state & LifecycleState.isAttached) names.push('isAttached');
    if (state & LifecycleState.isDetaching) names.push('isDetaching');
    if (state & LifecycleState.isUnbinding) names.push('isUnbinding');
    if (state & LifecycleState.isCached) names.push('isCached');
    if (state & LifecycleState.needsMount) names.push('needsMount');
    return names.join('|');
  }

  for (const stateFlag of [
    LifecycleState.none,
    LifecycleState.isBinding,
    LifecycleState.isBound,
    LifecycleState.isAttaching,
    LifecycleState.isAttached,
    LifecycleState.isDetaching,
    LifecycleState.isUnbinding,
    LifecycleState.isCached,
    LifecycleState.needsMount,
  ]) {
    const flagName = getStateFlagName(stateFlag);
    Assertion.addChainableMethod(
      flagName,
      function(msg) {
        msg = msg === undefined ? '' : msg + ' - ';
        const state = this._obj['$state'];
        let currentFlag = stateFlag;
        if (utils.flag(this, 'isBinding')) currentFlag |= LifecycleState.isBinding;
        if (utils.flag(this, 'isBound')) currentFlag |= LifecycleState.isBound;
        if (utils.flag(this, 'isAttaching')) currentFlag |= LifecycleState.isAttaching;
        if (utils.flag(this, 'isAttached')) currentFlag |= LifecycleState.isAttached;
        if (utils.flag(this, 'isDetaching')) currentFlag |= LifecycleState.isDetaching;
        if (utils.flag(this, 'isUnbinding')) currentFlag |= LifecycleState.isUnbinding;
        if (utils.flag(this, 'isCached')) currentFlag |= LifecycleState.isCached;
        if (utils.flag(this, 'needsMount')) currentFlag |= LifecycleState.needsMount;

        this.assert(
          (state & currentFlag) === currentFlag,
          `${msg}expected $state to have flags [${getStateFlagName(currentFlag)}], but got [${getStateFlagName(state)}]`,
          `${msg}expected $state to NOT have flags [${getStateFlagName(currentFlag)}], but got [${getStateFlagName(state)}]`);
      },
      function() {
        utils.flag(this, flagName, true);
      }
    );
  }
})

Error.stackTraceLimit = Infinity;

const unitTests: any = (require as any).context('./unit', true, /\.spec/);
unitTests.keys().forEach(unitTests);

const integrationTests: any = (require as any).context('./integration', true, /\.spec/);
integrationTests.keys().forEach(integrationTests);


