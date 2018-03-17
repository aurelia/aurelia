import * as ts from 'typescript';
import {
  ITemplateFactory,
  // IAureliaModule
} from './interfaces';
import {
  // getElementViewName,
  getPrivateClassName
} from './ts-util';
import { AbstractBinding, IBinding } from './binding';

export interface TemplateFactoryCode {
  imports: ts.ImportDeclaration[];
  view: ts.ClassDeclaration;
}

export class TemplateTransformer {

  static lifecycleMethods = {
    created: 'created',
    bind: 'bind',
    unbind: 'unbind',
    attach: 'attach',
    detach: 'detach'
  };

  observerPropName = '$observers';
  templatePropName = '$html';
  bindingPropName = '$bindings';
  elementAnchorPropName = '$anchor';
  elementViewPropName = '$view';
  elementScopePropName = '$scope';

  behaviorCounter = 0;

  constructor(
    public templateFactory: ITemplateFactory,
    public emitImport = true
  ) {

  }

  get code(): TemplateFactoryCode {
    let factory = this.templateFactory;
    // let file = ts.createSourceFile(factory.owner.fileName, '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    let observedProperties = factory.observedProperties;
    let elResource = factory.elementResource;
    if (!elResource) {
      // TODO: implement plain view template
      throw new Error('Template without element resource not supported');
    }
    let baseVmClassName = elResource.name;
    // let viewClassName = getElementViewName(viewModelClassName);
    let privateVmClassName = getPrivateClassName(baseVmClassName);
    return {
      imports: (this.emitImport
        ? [
          this.createImport(['createOverrideContext'], './framework/binding/scope'),
          this.createImport(['getAst'], './asts'),
          this.createImport(['Binding', 'TextBinding', 'Listener'], './framework/binding/binding'),
          this.createImport(['Observer'], './framework/binding/property-observation'),
          this.createImport(['Template'], './framework/templating/template'),
        ]
        : []
      ).concat(this.createAureliaDepenciesImport()),
      view: ts.createClassDeclaration(
        /* decorators */ undefined,
        /* modifiers */
        [
          ts.createToken(ts.SyntaxKind.ExportKeyword)
        ],
        baseVmClassName,
        /* type parameters */ undefined,
        /* heritage clauses */
        [
          ts.createHeritageClause(
            ts.SyntaxKind.ExtendsKeyword,
            [
              ts.createExpressionWithTypeArguments(
                undefined!,
                ts.createIdentifier(privateVmClassName)
              )
            ]
          ),
        ],
        /* members */
        [
          this.createTemplateProp(),
          this.createViewClassConstructor(),
          // this.createScopeProp(),
          // this.createObserverProp(observedProperties),
          this.createInitMethod(privateVmClassName),
          // this.createBindingsProp(),
          ...this.createLifecycleMethods(),
          ...observedProperties.reduce((propDeclarations: ts.ClassElement[], op: string) => {
            return [
              ...propDeclarations,
              this.createObserverGetter(op),
              this.createObserverSetter(op)
            ];
          }, /* observed properties init value */[]),
        ]
      ),
    }
  }

  // toSourceFile(): ts.SourceFile {
  //   let factory = this.templateFactory;
  //   let file = ts.createSourceFile(factory.owner.fileName, '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  //   let observedProperties = factory.observedProperties;
  //   let elResource = factory.elementResource;
  //   let viewModelName = elResource.impl.name.escapedText.toString();
  //   let viewClassName = getElementViewName(viewModelName);
  //   return ts.updateSourceFileNode(file, [
  //     ...(this.emitImport
  //       ? [
  //         this.createImport(['createOverrideContext'], './framework/binding/scope'),
  //         this.createImport(['getAst'], './asts'),
  //         this.createImport(['Binding', 'TextBinding', 'Listener'], './framework/binding/binding'),
  //         this.createImport(['Observer'], './framework/binding/property-observation'),
  //         this.createImport(['Template'], './framework/templating/template'),
  //       ]
  //       : []
  //     ),
  //     ts.createClassDeclaration(
  //       /* decorators */ undefined,
  //       /* modifiers */
  //       [
  //         ts.createToken(ts.SyntaxKind.ExportKeyword)
  //       ],
  //       viewClassName,
  //       /* type parameters */ undefined,
  //       /* heritage clauses */
  //       [
  //         ts.createHeritageClause(
  //           ts.SyntaxKind.ExtendsKeyword,
  //           [
  //             ts.createExpressionWithTypeArguments(
  //               undefined,
  //               ts.createIdentifier(viewModelName)
  //             )
  //           ]
  //         ),
  //       ],
  //       /* members */
  //       [
  //         this.createViewClassConstructor(),
  //         // this.createScopeProp(),
  //         // this.createObserverProp(observedProperties),
  //         this.createTemplateProp(),
  //         this.createInitMethod(viewClassName),
  //         // this.createBindingsProp(),
  //         ...this.createLifecycleMethods(),
  //         ...observedProperties.reduce((propDeclarations, op) => {
  //           return propDeclarations.concat([
  //             this.createObserverGetter(op),
  //             this.createObserverSetter(op)
  //           ]);
  //         }, /* observed properties init value */[]),
  //       ]
  //     ),
  //   ]);
  // }

  private createImport(names: string[], moduleName: string): ts.ImportDeclaration {
    return ts.createImportDeclaration(
      /* decorators */undefined,
      /* modifiers */ undefined,
      ts.createImportClause(
        /* default */ undefined,
        ts.createNamedImports(names.map(n => ts.createImportSpecifier(
          /* propertyName */ undefined,
          /* target name */ ts.createIdentifier(n)
        )))
      ),
      ts.createLiteral(moduleName)
    );
  }

  // =============================
  // VIEW CLASS GENERATION
  // =============================

  private createViewClassConstructor(): ts.ConstructorDeclaration {
    // let elRes = this.templateFactory.elementResource;
    // let elInitializers = elRes ? elRes.initializers : {};
    return ts.createConstructor(
      /** decorators */ undefined,
      /** modifiers */ undefined,
      /** params */[],
      ts.createBlock([
        // super()
        ts.createStatement(
          ts.createCall(
            ts.createSuper(),
            undefined,
            undefined!
          )
        ),
        // this.$scope = { ... }
        ts.createStatement(
          ts.createAssignment(
            ts.createPropertyAccess(
              ts.createThis(),
              this.elementScopePropName
            ),
            ts.createObjectLiteral(
              [
                ts.createPropertyAssignment(
                  'bindingContext',
                  ts.createThis()
                ),
                ts.createPropertyAssignment(
                  'overrideContext',
                  ts.createCall(
                    ts.createIdentifier('createOverrideContext'),
                    /*typeArguments*/ undefined,
                    /*arguments*/
                    [
                      ts.createThis()
                    ]
                  )
                )
              ],
              /*multiline*/ true
            )
          )
        ),
        // this.$observer = { ... }
        // ts.createStatement(
        //   ts.createCall(
        //     ts.createPropertyAccess(
        //       ts.createIdentifier('Object'),
        //       'defineProperty'
        //     ),
        //     /*typeArguments*/ undefined,
        //     /*arguments*/
        //     [
        //       ts.createThis(),
        //       ts.createLiteral(this.observerPropName),
        //       ts.createObjectLiteral(
        //         [
        //           ts.createPropertyAssignment(
        //             'value',
        //             ts.createObjectLiteral(
        //               this.templateFactory.observedProperties.map(op => {
        //                 let initializer = elInitializers[op];
        //                 return ts.createPropertyAssignment(
        //                   op,
        //                   ts.createNew(
        //                     ts.createIdentifier('Observer'),
        //                     /* type arguments */ undefined,
        //                     /* arguments */ initializer
        //                       ? [initializer]
        //                       : undefined
        //                   )
        //                 )
        //               }),
        //               /* multiline */ true
        //             )
        //           ),
        //           ts.createPropertyAssignment('configurable', ts.createTrue())
        //         ],
        //         /*multiline*/ true
        //       )
        //     ]
        //   ),
        // )
      ], /*multiline*/ true)
    );
  }

  // private createObserverProp(observedProperties: string[]) {
  //   return ts.createProperty(
  //     /* decorators */ undefined,
  //     /* modifiers */ undefined,
  //     this.observerPropName,
  //     /* question token */ undefined,
  //     /* type node */ undefined,
  //     ts.createObjectLiteral(
  //       observedProperties.map(op => ts.createPropertyAssignment(
  //         op,
  //         ts.createNew(
  //           ts.createIdentifier('Observer'),
  //           /* type arguments */ undefined,
  //           /* arguments */
  //           [
  //             ts.createLiteral('')
  //           ]
  //         )
  //       )),
  //       /* multiline */ true
  //     )
  //   );
  // }

  // private createScopeProp() {
  //   return ts.createProperty(
  //     /* decorators */ undefined,
  //     /* modifiers */ undefined,
  //     this.elementScopePropName,
  //     /* question token */ undefined,
  //     /* type node */ undefined,
  //     ts.createObjectLiteral(
  //       [
  //         ts.createPropertyAssignment(
  //           'bindingContext',
  //           ts.createThis()
  //         ),
  //         ts.createPropertyAssignment(
  //           'overrideContext',
  //           ts.createCall(
  //             ts.createIdentifier('createOverrideContext'),
  //             /*typeArguments*/ undefined,
  //             /*arguments*/
  //             [
  //               ts.createThis()
  //             ]
  //           )
  //         )
  //       ],
  //       /*multiline*/ true
  //     )
  //   );
  // }

  private createTemplateProp(): ts.PropertyDeclaration {
    return ts.createProperty(
      /* decorators */ undefined,
      [
        ts.createToken(ts.SyntaxKind.StaticKeyword)
      ],
      this.templatePropName,
      /* question token */ undefined,
      /* type node */ undefined,
      ts.createNew(
        ts.createIdentifier('Template'),
        /* type arguments */ undefined,
        /* arguments */
        [
          ts.createNoSubstitutionTemplateLiteral(this.templateFactory.html)
        ]
      )
    );
  }

  private createInitMethod(viewClassName: string): ts.MethodDeclaration {
    return ts.createMethod(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      /* asterisk token */ undefined,
      'applyTo',
      /* question token */ undefined,
      /* type params */ undefined,
      [
        ts.createParameter(
          /* decorators */ undefined,
          /** modifiers */ undefined,
          /** ... */ undefined,
          'anchor',
          /** question token */ undefined,
          /* typeNode */ undefined,
          // ts.createTypeReferenceNode(ts.createIdentifier('Element'), undefined),
          /** initializer */ undefined
        )
      ],
      /** type */ undefined,
      ts.createBlock(
        /** statements */
        [
          ts.createStatement(
            ts.createAssignment(
              ts.createPropertyAccess(
                ts.createThis(),
                this.elementAnchorPropName
              ),
              ts.createIdentifier('anchor')
            )
          ),
          ts.createStatement(
            ts.createAssignment(
              ts.createPropertyAccess(
                ts.createThis(),
                this.elementViewPropName
              ),
              ts.createCall(
                ts.createPropertyAccess(
                  ts.createPropertyAccess(
                    ts.createIdentifier(viewClassName),
                    this.templatePropName
                  ),
                  'create'
                ),
                /*typeArguments*/ undefined,
                /*arguments*/ undefined!
              )
            )
          ),
          ts.createVariableStatement(
            /*modifiers*/ undefined,
            [
              ts.createVariableDeclaration(
                AbstractBinding.targetsAccessor,
                /*type*/ undefined,
                ts.createPropertyAccess(
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.elementViewPropName
                  ),
                  AbstractBinding.targetsAccessor
                )
              ),
            ]
          ),
          ts.createStatement(
            ts.createAssignment(
              ts.createPropertyAccess(
                ts.createThis(),
                this.bindingPropName
              ),
              ts.createArrayLiteral(
                this.templateFactory.bindings.map(b => {
                  return b.behavior ? this.createBehaviorBinding(b) : b.code;
                }),
                /*multiline*/ true
              )
            ),
          ),
          ts.createReturn(ts.createThis())
        ],
        /** multiline */ true
      )
    );
  }

  private createLifecycleMethods(): ts.MethodDeclaration[] {
    return [
      ts.createMethod(
        /* decorators */ undefined,
        /* modifiers */ undefined,
        /* asterisk token */ undefined,
        TemplateTransformer.lifecycleMethods.bind,
        /* question token */ undefined,
        /* type params */ undefined,
        /* params */ undefined!,
        /** type */ undefined,
        /** body */
        ts.createBlock(
          /** statements */
          [
            ts.createVariableStatement(
              /*modifiers*/ undefined,
              [
                ts.createVariableDeclaration(
                  this.elementScopePropName,
                  /*type*/ undefined,
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.elementScopePropName
                  )
                )
              ]
            ),
            ts.createStatement(
              ts.createCall(
                ts.createPropertyAccess(
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.bindingPropName
                  ),
                  'forEach'
                ),
                /*typeArguments*/undefined,
                [
                  ts.createArrowFunction(
                    /*modifiers*/ undefined,
                    /*typeArguments*/ undefined,
                    [
                      ts.createParameter(
                        /*decorators*/ undefined,
                        /*modifiers*/ undefined,
                        /*dotdotdot*/ undefined,
                        'b',
                        /*question*/undefined,
                        /*type*/undefined,
                        /*initializer*/undefined
                      )
                    ],
                    /*type*/ undefined,
                    ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.createBlock(
                      [
                        ts.createStatement(
                          ts.createCall(
                            ts.createPropertyAccess(
                              ts.createIdentifier('b'),
                              TemplateTransformer.lifecycleMethods.bind
                            ),
                            /*typeArguments*/ undefined,
                            /*arguments*/
                            [
                              ts.createIdentifier(this.elementScopePropName)
                            ]
                          )
                        )
                      ],
                      /*multiline*/ true
                    )
                  )
                ]
              )
            ),
            ts.createStatement(
              ts.createCall(
                ts.createPropertyAccess(
                  ts.createSuper(),
                  ts.createIdentifier('bind')
                ),
                /* typeArguments */undefined,
                /* arguments */
                [
                  ts.createIdentifier(this.elementScopePropName)
                ]
              ),
            )
          ],
          /** multiline */ true
        )
      ),
      ts.createMethod(
        /* decorators */ undefined,
        /* modifiers */ undefined,
        /* asterisk token */ undefined,
        TemplateTransformer.lifecycleMethods.attach,
        /* question token */ undefined,
        /* type params */ undefined,
        /* params */ undefined!,
        /** type */ undefined,
        /** body */
        ts.createBlock(
          /** statements */
          [
            ts.createStatement(
              ts.createCall(
                ts.createPropertyAccess(
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.elementViewPropName
                  ),
                  'appendTo'
                ),
                /*typeArguments*/undefined,
                [
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.elementAnchorPropName
                  )
                ]
              )
            )
          ],
          /** multiline */ true
        )
      ),
      ts.createMethod(
        /* decorators */ undefined,
        /* modifiers */ undefined,
        /* asterisk token */ undefined,
        TemplateTransformer.lifecycleMethods.detach,
        /* question token */ undefined,
        /* type params */ undefined,
        /* params */ undefined!,
        /** type */ undefined,
        /** body */
        ts.createBlock(
          /** statements */
          [
            ts.createStatement(
              ts.createCall(
                ts.createPropertyAccess(
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.elementViewPropName
                  ),
                  'remove'
                ),
                /*typeArguments*/undefined,
                /*arugments*/undefined!
              )
            )
          ],
          /** multiline */ true
        )
      ),
      ts.createMethod(
        /* decorators */ undefined,
        /* modifiers */ undefined,
        /* asterisk token */ undefined,
        TemplateTransformer.lifecycleMethods.unbind,
        /* question token */ undefined,
        /* type params */ undefined,
        /* params */ undefined!,
        /** type */ undefined,
        /** body */
        ts.createBlock(
          /** statements */
          [
            ts.createVariableStatement(
              /*modifiers*/ undefined,
              [
                ts.createVariableDeclaration(
                  this.elementScopePropName,
                  /*type*/ undefined,
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.elementScopePropName
                  )
                )
              ]
            ),
            ts.createStatement(
              ts.createCall(
                ts.createPropertyAccess(
                  ts.createPropertyAccess(
                    ts.createThis(),
                    this.bindingPropName
                  ),
                  'forEach'
                ),
                /*typeArguments*/undefined,
                [
                  ts.createArrowFunction(
                    /*modifiers*/ undefined,
                    /*typeArguments*/ undefined,
                    [
                      ts.createParameter(
                        /*decorators*/ undefined,
                        /*modifiers*/ undefined,
                        /*dotdotdot*/ undefined,
                        'b',
                        /*question*/undefined,
                        /*type*/undefined,
                        /*initializer*/undefined
                      )
                    ],
                    /*type*/ undefined,
                    ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.createBlock(
                      [
                        ts.createStatement(
                          ts.createCall(
                            ts.createPropertyAccess(
                              ts.createIdentifier('b'),
                              TemplateTransformer.lifecycleMethods.unbind
                            ),
                            /*typeArguments*/ undefined,
                            /*arguments*/
                            [
                              ts.createIdentifier(this.elementScopePropName)
                            ]
                          )
                        )
                      ],
                      /*multiline*/ true
                    )
                  )
                ]
              )
            )
          ],
          /** multiline */ true
        )
      ),
    ];
  }

  private createBehaviorBinding(b: IBinding) {
    return ts.createBinary(
      ts.createPropertyAccess(
        ts.createThis(),
        `$b${b.behaviorIndex}`
      ),
      ts.SyntaxKind.EqualsToken,
      b.code,
    );
  }

  // private createBindingsProp() {
  //   return ts.createProperty(
  //     /* decorators */ undefined,
  //     [
  //       ts.createToken(ts.SyntaxKind.PublicKeyword),
  //       ts.createToken(ts.SyntaxKind.StaticKeyword)
  //     ],
  //     this.bindingPropName,
  //     /* question token */ undefined,
  //     /* type node */ undefined,
  //     ts.createCall(
  //       ts.createIdentifier('hydrateBindings'),
  //       /* type arguments */ undefined,
  //       /* arguments */
  //       [
  //         ts.createArrayLiteral(
  //           this.templateFactory.bindings.map(binding => {
  //             return binding.code
  //           }),
  //           /* multiline */ true
  //         )
  //       ]
  //     ),
  //   );
  // }

  private createObserverGetter(name: string): ts.GetAccessorDeclaration {
    return ts.createGetAccessor(
      /* decorators */undefined,
      [
        // ts.createToken(ts.SyntaxKind.PublicKeyword)
      ],
      name,
      /* parameters */ undefined!,
      /* type */ undefined,
      ts.createBlock([
        ts.createReturn(
          ts.createCall(
            ts.createPropertyAccess(
              ts.createPropertyAccess(
                ts.createPropertyAccess(
                  ts.createThis(),
                  this.observerPropName
                ),
                name
              ),
              'getValue'
            ),
            /* type arguments */ undefined,
            /* arguments */ undefined!
          )
        )
      ])
    );
  }

  private createObserverSetter(name: string, paramName = 'v', type?: string): ts.SetAccessorDeclaration {
    return ts.createSetAccessor(
      undefined,
      [
        // ts.createToken(ts.SyntaxKind.PublicKeyword)
      ],
      name,
      [
        ts.createParameter(
          /* decorators */ undefined,
          /* modifiers */ undefined,
          /* dotdotdot token */undefined,
          paramName,
          /* question token */ undefined,
          /* type */ undefined,
          /* initializer */undefined
        )
      ],
      ts.createBlock([
        ts.createStatement(
          ts.createCall(
            ts.createPropertyAccess(
              ts.createPropertyAccess(
                ts.createPropertyAccess(
                  ts.createThis(),
                  this.observerPropName
                ),
                name
              ),
              'setValue'
            ),
            /* type arguments */ undefined,
            /* arguments */
            [
              ts.createIdentifier(paramName)
            ]
          )
        )
      ])
    );
  }

  // =============================
  // VIEW CLASS GENERATION
  // =============================

  public createAureliaDepenciesImport() {
    let factory = this.templateFactory;
    let stmts: ts.ImportDeclaration[] = [];
    factory.usedDependencies.forEach((deps, auModule) => {
      stmts.push(this.createImport(deps.map(dep => dep.name), auModule.fileName));
    });
    return stmts;
  }
}
