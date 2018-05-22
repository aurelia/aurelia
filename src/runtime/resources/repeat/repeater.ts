import { IVisual } from '../../templating/visual';
import { IScope } from '../../binding/binding-context';

export interface IRepeater {
  local: string;
  key: any;
  value: any;
  visualsRequireLifecycle: boolean;
  scope: IScope;
  matcher: ((a: any, b: any) => boolean) | null;

  visualCount(): number;
  visuals(): ReadonlyArray<IVisual>;
  visualAt(index: number): IVisual;
  addVisualWithScope(scope: IScope): void;
  insertVisualWithScope(index: number, scope: IScope): void;
  moveVisual(sourceIndex: number, targetIndex: number): void;
  removeAllVisuals(returnToCache?: boolean, skipAnimation?: boolean): any;
  removeVisuals(visualsToRemove: IVisual[], returnToCache?: boolean, skipAnimation?: boolean): any;
  removeVisual(index: number, returnToCache?: boolean, skipAnimation?: boolean): any;
  updateBindings(view: IVisual): void;
}
