import { Navigation, Parameters, RoutingInstruction } from '@aurelia/router';
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class TheHook {
    public async canLoad(component: any, params: Parameters, instruction: RoutingInstruction, nav: Navigation) {
        console.log('TheHook', component.constructor.name);

        if (component.constructor.name === 'Disallowed') return true;

        // return '/disallowed';
        return true;
    }
}
