/*eslint indent:0*/
import { SyntaxInterpreter } from './syntax-interpreter';
import { AttributeMap } from './attribute-map';
import { Expression, TemplateLiteral, LiteralString } from './ast';
import { Parser } from './parser';
import { bindingMode, IInsepctionInfo, IBindingLanguage, TemplateFactoryBinding, bindingType, ELEMENT_REF_KEY } from './interfaces';
import { camelCase } from './util';

let info: IInsepctionInfo = {};

export class TemplatingBindingLanguage implements IBindingLanguage {

  syntaxInterpreter: SyntaxInterpreter;
  emptyStringExpression: Expression;

  constructor(
    public parser: Parser,
    public attributeMap: AttributeMap = AttributeMap.instance
  ) {
    this.syntaxInterpreter = new SyntaxInterpreter(parser, this, attributeMap);
    this.emptyStringExpression = parser.parse('\'\'');
    this.attributeMap = attributeMap;
  }

  inspectAttribute(
    element: Element,
    attrName: string,
    attrValue: string,
    targetIndex: number
  ): TemplateFactoryBinding {
    let parts = attrName.split('.');

    info.defaultBindingMode = null;

    if (parts.length === 2) {
      info.attrName = parts[0].trim();
      info.attrValue = attrValue;
      info.command = parts[1].trim();

      if (info.command === 'ref') {
        return [
          targetIndex,
          bindingType.ref,
          this.parser.parse(attrValue),
          camelCase(parts[0].trim())
        ];
      } else {
        return this.syntaxInterpreter.interpret(
          {},
          element,
          info,
          targetIndex
        );
      }
    } else if (attrName === 'ref') {
      return [
        targetIndex,
        bindingType.ref,
        this.parser.parse(attrValue),
        ELEMENT_REF_KEY
      ];
    } else {
      info.attrName = attrName;
      info.attrValue = attrValue;
      info.command = null;
      const templateLiteral = this.parseInterpolation(attrValue);
      if (templateLiteral === null) {
        return null;
        // return this.syntaxInterpreter.interpret(
        //   {},
        //   element,
        //   info,
        //   targetIndex
        // );
      } else {
        return [
          targetIndex,
          bindingType.binding,
          templateLiteral
        ];
        // info.expression = new InterpolationBindingExpression(
        //   this.attributeMap.map(element, attrName),
        //   interpolationParts,
        //   bindingMode.oneWay,
        //   attrName
        // );
      }
    }

    // return info;
  }

  // createAttributeInstruction(resources, element, theInfo, existingInstruction, context) {
  //   let instruction;

  //   if (theInfo.expression) {
  //     if (theInfo.attrName === 'ref') {
  //       return theInfo.expression;
  //     }

  //     instruction = existingInstruction || BehaviorInstruction.attribute(theInfo.attrName);
  //     instruction.attributes[theInfo.attrName] = theInfo.expression;
  //   } else if (theInfo.command) {
  //     instruction = this.syntaxInterpreter.interpret(
  //       resources,
  //       element,
  //       theInfo,
  //       existingInstruction,
  //       context
  //     );
  //   }

  //   return instruction;
  // }

  inspectTextContent(value: string): TemplateLiteral | null {
    let templateLiteral = this.parseInterpolation(value);
    if (templateLiteral === null) {
      return null;
    }
    return templateLiteral;
  }

  parseInterpolation(value: string): TemplateLiteral | null {
    let i = value.indexOf('${', 0);
    let ii = value.length;
    let char;
    let pos = 0;
    let open = 0;
    let quote = null;
    let interpolationStart;
    let parts: Expression[];
    let partIndex = 0;

    while (i >= 0 && i < ii - 2) {
      open = 1;
      interpolationStart = i;
      i += 2;

      do {
        char = value[i];
        i++;

        if (char === "'" || char === '"') {
          if (quote === null) {
            quote = char;
          } else if (quote === char) {
            quote = null;
          }
          continue;
        }

        if (char === '\\') {
          i++;
          continue;
        }

        if (quote !== null) {
          continue;
        }

        if (char === '{') {
          open++;
        } else if (char === '}') {
          open--;
        }
      } while (open > 0 && i < ii);

      if (open === 0) {
        // lazy allocate array
        parts = parts || [];
        if (value[interpolationStart - 1] === '\\' && value[interpolationStart - 2] !== '\\') {
          // escaped interpolation
          parts[partIndex] = new LiteralString(
            value.substring(pos, interpolationStart - 1) + value.substring(interpolationStart, i)
          );
          partIndex++;
          parts[partIndex] = this.emptyStringExpression;
          partIndex++;
        } else {
          // standard interpolation
          parts[partIndex] = new LiteralString(value.substring(pos, interpolationStart));
          partIndex++;
          parts[partIndex] = this.parser.parse(value.substring(interpolationStart + 2, i - 1));
          partIndex++;
        }
        pos = i;
        i = value.indexOf('${', i);
      } else {
        break;
      }
    }

    // no interpolation.
    if (partIndex === 0) {
      return null;
    }

    // literal.
    parts[partIndex] = new LiteralString(value.substr(pos));
    return new TemplateLiteral(parts);
  }
}
