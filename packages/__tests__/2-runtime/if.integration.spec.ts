import {
  AccessScopeExpression,
  BindingContext,
  BindingStrategy,
  Else,
  If,
  ILifecycle,
  IScope,
  LifecycleFlags,
  ProxyObserver,
  Scope,
  ViewFactory,
  Controller,
  CustomElementDefinition,
  ToViewBindingInstruction,
  getRenderContext,
} from '@aurelia/runtime';
import {
  AuDOMConfiguration,
  AuNode,
  eachCartesianJoin,
  assert,
} from '@aurelia/testing';
import { Writable } from '@aurelia/kernel';

describe(`If/Else`, function () {
  function runActivateLifecycle(sut: If<AuNode>, flags: LifecycleFlags, scope: IScope): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    sut.$controller.activate(sut.$controller, null, flags, scope);
  }
  function runDeactivateLifecycle(sut: If<AuNode>, flags: LifecycleFlags): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    sut.$controller.deactivate(sut.$controller, null, flags);
  }

  interface Spec {
    t: string;
  }
  interface StrategySpec extends Spec {
    strategy: BindingStrategy;
  }
  interface DuplicateOperationSpec extends Spec {
    activateTwice: boolean;
    deactivateTwice: boolean;
  }
  interface BindSpec extends Spec {
    ifPropName: string;
    elsePropName: string;
    ifText: string;
    elseText: string;

    value1: any;
    value2: any;
  }
  interface MutationSpec extends Spec {
    newValue1: any;
    newValue2: any;
  }
  interface FlagsSpec extends Spec {
    activateFlags1: LifecycleFlags;
    deactivateFlags1: LifecycleFlags;

    activateFlags2: LifecycleFlags;
    deactivateFlags2: LifecycleFlags;
  }

  const strategySpecs: StrategySpec[] = [
    { t: '1', strategy: BindingStrategy.getterSetter },
    { t: '2', strategy: BindingStrategy.proxies },
  ];

  const duplicateOperationSpecs: DuplicateOperationSpec[] = [
    { t: '1', activateTwice: false, deactivateTwice: false },
    { t: '2', activateTwice: true,  deactivateTwice: false },
    { t: '3', activateTwice: true,  deactivateTwice: true  },
    { t: '4', activateTwice: false, deactivateTwice: true  },
  ];

  const bindSpecs: BindSpec[] = [
    { t: '1', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: true,  value2: true  },
    { t: '2', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: true,  value2: false },
    { t: '3', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: false, value2: true  },
    { t: '4', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: false, value2: false },
  ];

  const none = LifecycleFlags.none;
  const bind = LifecycleFlags.fromBind;
  const unbind = LifecycleFlags.fromUnbind;

  const mutationSpecs: MutationSpec[] = [
    { t: '01', newValue1: false, newValue2: false, },
    { t: '02', newValue1: false, newValue2: true,  },
    { t: '03', newValue1: true,  newValue2: false, },
    { t: '04', newValue1: true,  newValue2: true,  },
  ];

  const flagsSpecs: FlagsSpec[] = [
    { t: '1', activateFlags1: none,            deactivateFlags1: none,              activateFlags2: none,            deactivateFlags2: none,              },
    { t: '2', activateFlags1: bind,            deactivateFlags1: unbind,            activateFlags2: bind,            deactivateFlags2: unbind,            },
  ];

  eachCartesianJoin(
    [strategySpecs, duplicateOperationSpecs, bindSpecs, mutationSpecs, flagsSpecs],
    (strategySpec, duplicateOperationSpec, bindSpec, mutationSpec, flagsSpec) => {
      it(`verify if/else behavior - strategySpec ${strategySpec.t}, duplicateOperationSpec ${duplicateOperationSpec.t}, bindSpec ${bindSpec.t}, mutationSpec ${mutationSpec.t}, flagsSpec ${flagsSpec.t}, `, function () {
        const { strategy } = strategySpec;
        const { activateTwice, deactivateTwice } = duplicateOperationSpec;
        const { ifPropName, elsePropName, ifText, elseText, value1, value2 } = bindSpec;
        const { newValue1, newValue2 } = mutationSpec;
        const { activateFlags1, deactivateFlags1, activateFlags2, deactivateFlags2 } = flagsSpec;

        // common stuff
        const baseFlags: LifecycleFlags = strategy as unknown as LifecycleFlags;
        const proxies = (strategy & BindingStrategy.proxies) > 0;
        const container = AuDOMConfiguration.createContainer();
        const lifecycle = container.get(ILifecycle);

        const location = AuNode.createRenderLocation();
        const location2 = AuNode.createRenderLocation();
        const host = AuNode.createHost().appendChild(location.$start).appendChild(location).appendChild(location2.$start).appendChild(location2);

        const ifContext = getRenderContext<AuNode>(
          CustomElementDefinition.create({
            name: void 0,
            template: AuNode.createText().makeTarget(),
            instructions: [
              [
                new ToViewBindingInstruction(new AccessScopeExpression(ifPropName), 'textContent'),
              ],
            ],
            needsCompile: false,
          }),
          container,
        );
        const elseContext = getRenderContext<AuNode>(
          CustomElementDefinition.create({
            name: void 0,
            template: AuNode.createText().makeTarget(),
            instructions: [
              [
                new ToViewBindingInstruction(new AccessScopeExpression(elsePropName), 'textContent'),
              ],
            ],
            needsCompile: false,
          }),
          container,
        );

        const ifFactory = new ViewFactory<AuNode>('if-view', ifContext, lifecycle, void 0, null);
        const elseFactory = new ViewFactory<AuNode>('else-view', elseContext, lifecycle, void 0, null);
        let sut: If<AuNode>;
        let elseSut: Else<AuNode>;
        if (proxies) {
          sut = ProxyObserver.getOrCreate(new If<AuNode>(ifFactory, location)).proxy;
          elseSut = ProxyObserver.getOrCreate(new Else<AuNode>(elseFactory)).proxy;
        } else {
          sut = new If<AuNode>(ifFactory, location);
          elseSut = new Else<AuNode>(elseFactory);
        }
        elseSut.link(sut);
        (sut as Writable<If>).$controller = Controller.forCustomAttribute(sut, lifecycle, (void 0)!);

        const firstBindInitialNodesText: string = value1 ? ifText : elseText;
        const firstBindFinalNodesText = firstBindInitialNodesText;
        const firstAttachInitialHostText = value1 ? ifText : elseText;
        const firstAttachFinalHostText: string = newValue1 ? ifText : elseText;

        const secondBindInitialNodesText: string = value2 ? ifText : elseText;
        const secondBindFinalNodesText = secondBindInitialNodesText;
        const secondAttachInitialHostText = value2 ? ifText : elseText;
        const secondAttachFinalHostText: string = newValue2 ? ifText : elseText;

        // -- Round 1 --

        const ctx = BindingContext.create(baseFlags, {
          [ifPropName]: ifText,
          [elsePropName]: elseText
        });
        const scope = Scope.create(baseFlags, ctx);

        sut.value = value1;

        runActivateLifecycle(sut, baseFlags | activateFlags1, scope);

        assert.strictEqual(sut.view.nodes.firstChild['textContent'], firstBindInitialNodesText, '$nodes.textContent #1');

        if (activateTwice) {
          runActivateLifecycle(sut, baseFlags | activateFlags1, scope);
        }

        assert.strictEqual(sut.view.nodes.firstChild['textContent'], firstBindFinalNodesText, '$nodes.textContent #2');

        assert.strictEqual(host.textContent, firstAttachInitialHostText, 'host.textContent #1');

        sut.value = newValue1;

        assert.strictEqual(host.textContent, firstAttachFinalHostText, 'host.textContent #2');

        runDeactivateLifecycle(sut, baseFlags | deactivateFlags1);
        if (deactivateTwice) {
          runDeactivateLifecycle(sut, baseFlags | deactivateFlags1);
        }

        assert.strictEqual(host.textContent, '', 'host.textContent #3');

        // unbind should not affect existing values but stops them from updating afterwards

        // -- Round 2 --

        sut.value = value2;

        runActivateLifecycle(sut, baseFlags | activateFlags2, scope);

        assert.strictEqual(sut.view.nodes.firstChild['textContent'], secondBindInitialNodesText, '$nodes.textContent #3');
        if (activateTwice) {
          runActivateLifecycle(sut, baseFlags | activateFlags2, scope);
        }

        assert.strictEqual(sut.view.nodes.firstChild['textContent'], secondBindFinalNodesText, '$nodes.textContent #4');

        assert.strictEqual(host.textContent, secondAttachInitialHostText, 'host.textContent #4');

        sut.value = newValue2;

        assert.strictEqual(host.textContent, secondAttachFinalHostText, 'host.textContent #5');

        runDeactivateLifecycle(sut, baseFlags | deactivateFlags2);
        if (deactivateTwice) {
          runDeactivateLifecycle(sut, baseFlags | deactivateFlags2);
        }

        assert.strictEqual(host.textContent, '', 'host.textContent #6');

        assert.isSchedulerEmpty();
      });
    });
});
