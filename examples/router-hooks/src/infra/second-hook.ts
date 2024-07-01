import { Navigation, Parameters, RoutingInstruction } from '@aurelia/router';
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class TheSecondHook {
    public async canLoad(component: any, params: Parameters, instruction: RoutingInstruction, nav: Navigation, previousHookResult: any): Promise<boolean | string> {
        // Remove comment to see the error
        const users = await fetch('https://dummyjson.com/users').then((res) => res.json());
        console.log('======= awaited fetch', component, previousHookResult, users);

        return true;
    }
}
