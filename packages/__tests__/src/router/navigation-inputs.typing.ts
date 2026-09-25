import type { IContextRouter, IRouteContext, IRouter, IViewportInstruction, NavigationInstruction } from '@aurelia/router';

// Author-created instructions have not been recognized yet. Consumers should
// not need to manufacture an internal recognition result to describe a route.
export function checkNavigationInputTypes(router: IRouter, contextual: IContextRouter, context: IRouteContext): void {
  const instruction: IViewportInstruction = { component: 'reports', params: { id: '1' } };
  const instructions: readonly NavigationInstruction[] = Object.freeze([instruction]);
  void router.load(instructions);
  void router.generatePath(instructions);
  void contextual.generatePath(instructions);
  void context.generateRelativePath(instructions);
  void context.generateRootedPath(instructions);
}
