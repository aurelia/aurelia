import { AccessScope, IExpression, AccessMember, IExpressionParser,Repeat, ForOfStatement, BindingIdentifier  } from '@aurelia/runtime';
import { IContainer } from '@aurelia/kernel';

const expressionCache: Record<string, IExpression> = {
  databases: new ForOfStatement(new BindingIdentifier('db'), new AccessScope('databases')),
  dbname: new AccessMember(new AccessScope('db'), 'dbname'),
  countClassName: new AccessMember(new AccessMember(new AccessScope('db'), 'lastSample'), 'countClassName'),
  nbQueries: new AccessMember(new AccessMember(new AccessScope('db'), 'lastSample'), 'nbQueries'),
  topFiveQueries: new ForOfStatement(new BindingIdentifier('q'), new AccessMember(new AccessMember(new AccessScope('db'), 'lastSample'), 'topFiveQueries')),
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
