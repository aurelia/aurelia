import { AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, IsPrimary, IExpression } from '@aurelia/runtime';

export function returnEmptyArr(): any[] {
  return [];
}

export function createPrimitiveLiteralArr(): { expr: PrimitiveLiteral, text: string }[] {
  return [
    { expr: new PrimitiveLiteral(true),      text: '     true' },
    { expr: new PrimitiveLiteral(false),     text: '    false' },
    { expr: new PrimitiveLiteral(null),      text: '     null' },
    { expr: new PrimitiveLiteral(undefined), text: 'undefined' },
    { expr: new PrimitiveLiteral(0),         text: '        0' },
    { expr: new PrimitiveLiteral(''),        text: '       \'\'' },
    { expr: new PrimitiveLiteral('foo'),     text: '    \'foo\'' }
  ];
}
export function createLiteralTrueArr(): { expr: PrimitiveLiteral, text: string }[] {
  return [{ expr: new PrimitiveLiteral(true),      text: '     true' }];
}
export function createLiteralFalseArr(): { expr: PrimitiveLiteral, text: string }[] {
  return [{ expr: new PrimitiveLiteral(false),      text: '    false' }];
}
export function createLiteralNullArr(): { expr: PrimitiveLiteral, text: string }[] {
  return [{ expr: new PrimitiveLiteral(null),      text: '     null' }];
}
export function createLiteralUndefinedArr(): { expr: PrimitiveLiteral, text: string }[] {
  return [{ expr: new PrimitiveLiteral(undefined),      text: 'undefined' }];
}

export function createAccessScopeArr(ancestors: number): { expr: AccessScope, text: string }[] {
  const parent = '$parent.';
  const name = 'foo';
  let i = 0;
  const arr = [];
  while (i < ancestors + 1) {
    const indentation = new Array((ancestors - i) * (parent.length + 1)).join(' ');
    const parents = new Array(i + 1).join(parent);
    arr.push({ expr: new AccessScope(name, i), text: `${indentation}${parents}${name}` });
    i++;
  }
  return arr;
}

export function createSingleAccessScopeArr(): { expr: AccessScope, text: string }[] {
  return createAccessScopeArr(0);
}

export function createAccessThisArr(ancestors: number): { expr: AccessThis, text: string }[] {
  const parent = '$parent.';
  let i = 0;
  const arr = [];
  while (i <= ancestors) {
    let name = i === 0 ? '$this' : '';
    const indentation = new Array(Math.max(((ancestors - i) * (parent.length + 1)) - name.length, 1)).join(' ').slice(0, -1);
    const parents = new Array(i + 1).join(parent).slice(0, -1);
    arr.push({ expr: new AccessThis(i), text: `${indentation}${parents}${name}` });
    i++;
  }
  return arr;
}

export function createSingleAccessThisArr(): { expr: AccessThis, text: string }[] {
  return createAccessThisArr(0);
}

function prepareArgs(createArgsArr: (() => { expr: IExpression, text: string }[])[]): { args: IExpression[], text: string } {
  const args = [];
  let text = '';
  for (const createArgs of createArgsArr) {
    for (const { expr: argsExpr, text: argsText } of createArgs()) {
      args.push(argsExpr);
      text += `${argsText}, `
    }
  }
  return { args, text };
}

export function createCallFunctionArr(
  createObjectsArr: (() => { expr: IExpression, text: string }[])[],
  createArgsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: CallFunction, text: string }[] {
  const { args, text: argsText } = prepareArgs(createArgsArr);
  const arr = [];
  for (const createObjects of createObjectsArr) {
    for (const { expr: objExpr, text: objText } of createObjects()) {
      arr.push({ expr: new CallFunction(objExpr, args), text: `${objText}(${argsText.slice(0, -2)})` });
    }
  }
  return arr;
}

export function createNoArgsCallFunctionArr(
  createObjectsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: CallFunction, text: string }[] {
  return createCallFunctionArr(createObjectsArr, [returnEmptyArr]);
}

export function createSingleNoArgsCallFunctionArr(): { expr: CallFunction, text: string }[] {
  return createNoArgsCallFunctionArr([createSingleAccessScopeArr]);
}

export function createCallScopeArr(
  createArgsArr: (() => { expr: IExpression, text: string }[])[],
  ancestors: number
): { expr: CallScope, text: string }[] {
  const parent = '$parent.';
  let i = 0;
  const arr = [];
  const { args, text: argsText } = prepareArgs(createArgsArr);
  while (i <= ancestors) {
    let name = i === 0 ? '$this.' : '';
    const indentation = new Array(Math.max(((ancestors - i) * (parent.length + 1)) - name.length, 1)).join(' ').slice(0, -1);
    const parents = new Array(i + 1).join(parent).slice(0, -1);
    arr.push({ expr: new CallScope('foo', args, i), text: `${indentation}${parents}${name}foo(${argsText.slice(0, -2)})` });
    i++;
  }
  return arr;
}

export function createNoArgsCallScopeArr(ancestors: number): { expr: CallScope, text: string }[] {
  return createCallScopeArr([returnEmptyArr], ancestors);
}

export function createSingleNoArgsCallScopeArr(): { expr: CallScope, text: string }[] {
  return createNoArgsCallScopeArr(0);
}

export function createCallMemberArr(
  createObjectsArr: (() => { expr: IExpression, text: string }[])[],
  createArgsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: CallMember, text: string }[] {
  const arr = [];
  const { args, text: argsText } = prepareArgs(createArgsArr);
  for (const createObjects of createObjectsArr) {
    for (const { expr: objExpr, text: objText } of createObjects()) {
      arr.push({ expr: new CallMember(objExpr, 'foo', args),    text: `${objText}.foo(${argsText.slice(0, -2)})` });
    }
  }
  return arr;
}

export function createNoArgsCallMemberArr(
  createObjectsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: CallMember, text: string }[] {
  return createCallMemberArr(createObjectsArr, [returnEmptyArr]);
}

export function createFooNoArgsCallMemberArr(): { expr: CallMember, text: string }[] {
  return createNoArgsCallMemberArr([createSingleAccessScopeArr]);
}

export function createAccessMemberArr(
  createObjectsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: AccessMember, text: string }[] {
  const arr = [];
  for (const createObjects of createObjectsArr) {
    for (const { expr: objExpr, text: objText } of createObjects()) {
      arr.push({ expr: new AccessMember(objExpr, 'bar'), text: `${objText}.bar` });
    }
  }
  return arr;
}

export function createFooAccessMemberArr(): { expr: AccessMember, text: string }[] {
  return createAccessMemberArr([createSingleAccessScopeArr]);
}

export function createAccessKeyedArr(
  createObjectsArr: (() => { expr: IExpression, text: string }[])[],
  createKeysArr: (() => { expr: IExpression, text: string }[])[]
): { expr: AccessKeyed, text: string }[] {
  const arr = [];
  for (const createObjects of createObjectsArr) {
    for (const { expr: objExpr, text: objText } of createObjects()) {
      for (const createKeys of createKeysArr) {
        for (const { expr: keyExpr, text: keyText } of createKeys()) {
          arr.push({ expr: new AccessKeyed(objExpr, keyExpr), text: `${objText}[${keyText}]` });
        }
      }
    }
  }
  return arr;
}

export function createFooAccessKeyedArr(
  createKeysArr: (() => { expr: IExpression, text: string }[])[]
): { expr: AccessKeyed, text: string }[] {
  return createAccessKeyedArr([createSingleAccessScopeArr], createKeysArr);
}

export function createFooFooAccessKeyedArr(): { expr: AccessKeyed, text: string }[] {
  return createFooAccessKeyedArr([createSingleAccessScopeArr]);
}

export function createObjectLiteralArr(
  createValuesArr: (() => { expr: IExpression, text: string }[])[]
): { expr: ObjectLiteral, text: string }[] {
  const keys = [];
  const values = [];
  let text = '{';
  for (const createValues of createValuesArr) {
    for (const { expr: valueExpr, text: valueText } of createValues()) {
      keys.push(valueText.trim());
      values.push(valueExpr);
      text += `${valueText}: ${valueText}, `;
    }
  }
  text = (values.length ? text.slice(0, -2) : text) + '}';
  return [
    { expr: new ObjectLiteral(keys, values), text: text }
  ];
}

export function createEmptyObjectLiteralArr(): { expr: ObjectLiteral, text: string }[] {
  return createObjectLiteralArr([returnEmptyArr]);
}

export function createArrayLiteralArr(
  createElementsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: ArrayLiteral, text: string }[] {
  const elements = [];
  let text = '[';
  for (const createElements of createElementsArr) {
    for (const { expr: elementExpr, text: elementText } of createElements()) {
      elements.push(elementExpr);
      text += `${elementText}, `;
    }
  }
  text = (elements.length ? text.slice(0, -2) : text) + ']';
  return [
    { expr: new ArrayLiteral(elements), text: text }
  ];
}

export function createEmptyArrayLiteralArr(): { expr: ArrayLiteral, text: string }[] {
  return createArrayLiteralArr([returnEmptyArr]);
}

export function createTemplateArr(
  createExpressionsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: Template, text: string }[] {
  const arr = [];
  for (const part of ['', 'a']) {
    const parts = [];
    const expressions = [];
    let text = '`';
    for (const createExpressions of createExpressionsArr) {
      for (const { expr: expressionExpr, text: expressionText } of createExpressions()) {
        parts.push(part);
        expressions.push(expressionExpr);
        text += `${part}${expressionText.trim()}`;
      }
    }
    parts.push(part);
    text += part;
    text += '`';
    arr.push({ expr: new Template(parts, expressions), text: text});
  }
  return arr;
}

export function createEmptyTemplateArr(): { expr: Template, text: string }[] {
  return createTemplateArr([returnEmptyArr]);
}

export function createTaggedTemplateArr(
  createExpressionsArr: (() => { expr: IExpression, text: string }[])[],
  createFunctionsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: TaggedTemplate, text: string }[] {
  const arr = [];
  for (const part of ['', 'a']) {
    for (const createFunctions of createFunctionsArr) {
      for (const { expr: functionExpr, text: functionText } of createFunctions()) {
        const parts = [];
        const expressions = [];
        let text = '`';
        for (const createExpressions of createExpressionsArr) {
          for (const { expr: expressionExpr, text: expressionText } of createExpressions()) {
            parts.push(part);
            expressions.push(expressionExpr);
            text += `${part}${expressionText.trim()}`;
          }
        }
        parts.push(part);
        text += part;
        text += '`';
        arr.push({ expr: new TaggedTemplate(parts, parts, <any>functionExpr, expressions), text: text});
      }
    }
  }
  return arr;
}

export function createEmptyTaggedTemplateArr(
  createFunctionsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: TaggedTemplate, text: string }[] {
  return createTaggedTemplateArr([returnEmptyArr], createFunctionsArr);
}


export function createFooEmptyTaggedTemplateArr(): { expr: TaggedTemplate, text: string }[] {
  return createEmptyTaggedTemplateArr([createSingleAccessScopeArr]);
}


export function createUnaryArr(
  createExpressionsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: Unary, text: string }[] {
  const arr = [];
  for (const op of [
    '  void ',
    'typeof ',
    '      !',
    '      -',
    '      +'
  ]) {
    for (const createExpressions of createExpressionsArr) {
      for (const { expr: expressionExpr, text: expressionText } of createExpressions()) {
        arr.push({ expr: new Unary(<any>op.trim(), <any>expressionExpr), text: `${op}${expressionText}`});
      }
    }
  }
  return arr;
}

export function createFooUnaryArr(): { expr: Unary, text: string }[] {
  return createUnaryArr([createSingleAccessScopeArr]);
}

export function createBinaryArr(
  createLeftExpressionsArr: (() => { expr: IExpression, text: string }[])[],
  createRightExpressionsArr: (() => { expr: IExpression, text: string }[])[]
): { expr: Binary, text: string }[] {
  const arr = [];
  for (const op of [
    '          &&',
    '          ||',
    '          ==',
    '         ===',
    '          !=',
    '         !==',
    ' instanceof ',
    '         in ',
    '           +',
    '           *',
    '           /',
    '           %',
    '           <',
    '           >',
    '          <=',
    '          >='
  ]) {
    for (const createLeftExpressions of createLeftExpressionsArr) {
      for (const { expr: leftExpr, text: leftText } of createLeftExpressions()) {
        for (const createRightExpressions of createRightExpressionsArr) {
          for (const { expr: rightExpr, text: rightText } of createRightExpressions()) {
            arr.push({ expr: new Binary(<any>op.trim(), leftExpr, rightExpr), text: `${leftText}${op}${rightText}`});
          }
        }
      }
    }
  }
  return arr;
}

export function createFooBinaryArr(): { expr: Binary, text: string }[] {
  return createBinaryArr([createSingleAccessScopeArr], [createSingleAccessScopeArr]);
}

export function createConditionalArr(
  createConditionsArr: (() => { expr: IExpression, text: string }[])[],
  createYesesArr: (() => { expr: IExpression, text: string }[])[],
  createNoesArr: (() => { expr: IExpression, text: string }[])[]
): { expr: Conditional, text: string }[] {
  const arr = [];
  for (const createConditions of createConditionsArr) {
    for (const { expr: conditionExpr, text: conditionText } of createConditions()) {
      for (const createYeses of createYesesArr) {
        for (const { expr: yesExpr, text: yesText } of createYeses()) {
          for (const createNoes of createNoesArr) {
            for (const { expr: noExpr, text: noText } of createNoes()) {
              arr.push({ expr: new Conditional(conditionExpr, yesExpr, noExpr), text: `${conditionText}?${yesText}:${noText}` })
            }
          }
        }
      }
    }
  }
  return arr;
}

export function createFooConditionalArr(
  createYesesArr: (() => { expr: IExpression, text: string }[])[],
  createNoesArr: (() => { expr: IExpression, text: string }[])[]
): { expr: Conditional, text: string }[] {
  return createConditionalArr([createSingleAccessScopeArr], createYesesArr, createNoesArr);
}

export function createFooFooConditionalArr(
  createNoesArr: (() => { expr: IExpression, text: string }[])[]
): { expr: Conditional, text: string }[] {
  return createFooConditionalArr([createSingleAccessScopeArr], createNoesArr);
}

export function createFooFooFooConditionalArr(): { expr: Conditional, text: string }[] {
  return createFooFooConditionalArr([createSingleAccessScopeArr]);
}

export function getSimplePrimaryExpressionFactories(): (() => { expr: IExpression, text: string }[])[] {
  return [
    createPrimitiveLiteralArr,
    createSingleAccessScopeArr,
    createSingleAccessThisArr,
    createEmptyArrayLiteralArr,
    createEmptyObjectLiteralArr,
    createEmptyTemplateArr
  ];
}

export function getSimpleExpressionFactories(): (() => { expr: IExpression, text: string }[])[] {
  return [
    createPrimitiveLiteralArr,
    createSingleAccessScopeArr,
    createSingleAccessThisArr,
    createEmptyArrayLiteralArr,
    createEmptyObjectLiteralArr,
    createEmptyTemplateArr,
    createSingleNoArgsCallFunctionArr,
    createSingleNoArgsCallScopeArr,
    createFooNoArgsCallMemberArr,
    createFooAccessMemberArr,
    createFooFooAccessKeyedArr,
    //createFooEmptyTaggedTemplateArr
  ];
}
