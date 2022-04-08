import { IRouter } from "@aurelia/router";

export class One {
    public constructor(@IRouter private router: IRouter) { }

    async lazyFour() {
        const four = import('./four');
        console.log('Four', four);
        this.router.load([{ component: four, viewport: 'default' }]);
    }
}
