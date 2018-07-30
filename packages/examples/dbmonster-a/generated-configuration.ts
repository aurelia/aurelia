//import { Repeater } from '../runtime/templating/resources/repeater';
import { AccessScope, IExpression, AccessMember } from "../runtime/binding/ast";
import { IContainer } from "../kernel/di";
import { IExpressionParser } from "../runtime/binding/expression-parser";
import { Repeat } from "../runtime/templating/resources/repeat/repeat";

const expressionCache: Record<string, IExpression> = {
  databases: new AccessScope('databases'),
  dbname: new AccessMember(new AccessScope('db'), 'dbname'),
  countClassName: new AccessMember(new AccessMember(new AccessScope('db'), 'lastSample'), 'countClassName'),
  nbQueries: new AccessMember(new AccessMember(new AccessScope('db'), 'lastSample'), 'nbQueries'),
  topFiveQueries: new AccessMember(new AccessMember(new AccessScope('db'), 'lastSample'), 'topFiveQueries'),
  elapsedClassName: new AccessMember(new AccessScope('q'), 'elapsedClassName'),
  formatElapsed: new AccessMember(new AccessScope('q'), 'formatElapsed'),
  query: new AccessMember(new AccessScope('q'), 'query')
};

const globalResources: any[] = [Repeat];

export const GeneratedConfiguration = {
  register(container: IContainer) {
    container.get(IExpressionParser).cache(expressionCache);
    container.register(...globalResources);
  }
};
