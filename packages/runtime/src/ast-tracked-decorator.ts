import { AnyFunction } from '@aurelia/kernel';
import { astTrackableMethodMarker } from './ast.eval';
import { rtObjectAssign } from './utilities';
import { createMappedError, ErrorNames } from './errors';

export type AstTrackedDecoratorOptions = {
    useProxy?: boolean;
};

export function astTracked(options: AstTrackedDecoratorOptions = {}) {
    return function (target: unknown, context: ClassMethodDecoratorContext) {
        if (context.kind !== 'method') {
            throw createMappedError(ErrorNames.ast_tracked_decorator_not_a_method, String(context.name));
        }

        return rtObjectAssign(target as AnyFunction, {
            [astTrackableMethodMarker]: { ... options }
        });
    };
}
