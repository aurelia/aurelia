import {
  ITemplateSource,
  TargetedInstructionType,
  BindingMode,
  ForOfStatement,
  BindingIdentifier,
  Aurelia,
  Repeat,
  IChangeSet,
  DOM,
  INode,
  ICustomElement,
  IExpressionParser,
  AccessScope,
  AccessMember
} from '../../../../src/index';
import { IContainer, DI } from '../../../../../kernel/src/index';
import { createAureliaRepeaterConfig, createRepeater } from '../../util';
import { expect } from 'chai';

describe('ArrayRepeater - render html', () => {
  let container: IContainer;
  let changeSet: IChangeSet;
  let au: Aurelia;
  let host: INode;

  let aureliaConfig: ReturnType<typeof createAureliaRepeaterConfig>;
  let component: ICustomElement;

  beforeEach(() => {
    container = DI.createContainer();
    changeSet = container.get(IChangeSet);
    au = new Aurelia(container);
    host = DOM.createElement('app');
    DOM.appendChild(document.body, host);
  });

  it('triple nested repeater should render correctly', () => {
    const initItems = [
      {
        id: 1,
        innerTodos: [
          { innerId: 10, innerInnerTodos: [ { innerInnerId: 100 }, { innerInnerId: 101 }, { innerInnerId: 102 } ] },
          { innerId: 11, innerInnerTodos: [ { innerInnerId: 110 }, { innerInnerId: 111 }, { innerInnerId: 112 } ] },
          { innerId: 12, innerInnerTodos: [ { innerInnerId: 120 }, { innerInnerId: 121 }, { innerInnerId: 122 } ] }
        ]
      },
      { id: 2,
        innerTodos: [
          { innerId: 20, innerInnerTodos: [ { innerInnerId: 200 }, { innerInnerId: 201 }, { innerInnerId: 202 } ] },
          { innerId: 21, innerInnerTodos: [ { innerInnerId: 210 }, { innerInnerId: 211 }, { innerInnerId: 212 } ] },
          { innerId: 22, innerInnerTodos: [ { innerInnerId: 220 }, { innerInnerId: 221 }, { innerInnerId: 222 } ] }
        ]
      },
      { id: 3,
        innerTodos: [
          { innerId: 30, innerInnerTodos: [ { innerInnerId: 300 }, { innerInnerId: 301 }, { innerInnerId: 302 } ] },
          { innerId: 31, innerInnerTodos: [ { innerInnerId: 310 }, { innerInnerId: 311 }, { innerInnerId: 312 } ] },
          { innerId: 32, innerInnerTodos: [ { innerInnerId: 320 }, { innerInnerId: 321 }, { innerInnerId: 322 } ] }
        ]
      },
    ];
    const expressionCache = {
      todos: new ForOfStatement(new BindingIdentifier('todo'), new AccessScope('todos')),
      id: new AccessMember(new AccessScope('todo'), 'id'),
      length: new AccessMember(new AccessMember(new AccessScope('todo'), 'innerTodos'), 'length'),
      innerTodos: new ForOfStatement(new BindingIdentifier('innerTodo'), new AccessMember(new AccessScope('todo'), 'innerTodos')),
      innerId: new AccessMember(new AccessScope('innerTodo'), 'innerId'),
      innerLength: new AccessMember(new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos'), 'length'),
      innerInnerTodos: new ForOfStatement(new BindingIdentifier('innerInnerTodo'), new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos')),
      innerInnerId: new AccessMember(new AccessScope('innerInnerTodo'), 'innerInnerId')
    };
    aureliaConfig = {
      register(container: IContainer) {
        (<IExpressionParser>container.get(IExpressionParser)).cache(expressionCache);
        container.register(<any>Repeat);
      }
    };
    au.register(aureliaConfig);
    const templateSource: ITemplateSource = {
      name: 'app',
      dependencies: [],
      templateOrNode: `<span class="au"></span> `,
      instructions: [
        [
          {
            type: TargetedInstructionType.hydrateTemplateController,
            res: 'repeat',
            src: {
              cache: "*",
              templateOrNode: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
              instructions: [
                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'id' } ],
                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'length' } ],
                [
                  {
                    type: TargetedInstructionType.hydrateTemplateController,
                    res: 'repeat',
                    src: {
                      cache: "*",
                      templateOrNode: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
                      instructions: [
                        [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerId' } ],
                        [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerLength' } ],
                        [
                          {
                            type: TargetedInstructionType.hydrateTemplateController,
                            res: 'repeat',
                            src: {
                              cache: "*",
                              templateOrNode: `<span class="au"></span> `,
                              instructions: [
                                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerInnerId' } ]
                              ]
                            },
                            instructions: [
                              { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'innerInnerTodos', dest: 'items' },
                              { type: TargetedInstructionType.setProperty, value: 'innerInnerTodo', dest: 'local' },
                              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                            ]
                          }
                        ]
                      ]
                    },
                    instructions: [
                      { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'innerTodos', dest: 'items' },
                      { type: TargetedInstructionType.setProperty, value: 'innerTodo', dest: 'local' },
                      { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                    ]
                  }
                ]
              ]
            },
            instructions: [
              { type: TargetedInstructionType.propertyBinding, mode: BindingMode.toView, srcOrExpr: 'todos', dest: 'items' },
              { type: TargetedInstructionType.setProperty, value: 'todo', dest: 'local' },
              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
            ]
          }
        ]
      ],
      surrogates: []
    }
    component = createRepeater(<any>{ colName: 'todos' }, initItems, templateSource);

    au.app({ host, component });
    au.start();
    changeSet.flushChanges();

    const expectedText = initItems.map(i => `${i.id}${i.innerTodos.length}${i.innerTodos.map(ii => `${ii.innerId}${ii.innerInnerTodos.length}${ii.innerInnerTodos.map(iii => `${iii.innerInnerId}`).join('')}`).join(' ')}`).join(' ');
    expect(host['innerText']).to.equal(expectedText);
  });
});

