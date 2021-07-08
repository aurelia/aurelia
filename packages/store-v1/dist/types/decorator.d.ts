import { Observable } from 'rxjs';
import { Store } from './store.js';
export interface ConnectToSettings<T, R = T | any> {
    onChanged?: string;
    selector: ((store: Store<T>) => Observable<R>) | MultipleSelector<T, R>;
    setup?: string;
    target?: string;
    teardown?: string;
}
export interface MultipleSelector<T, R = T | any> {
    [key: string]: ((store: Store<T>) => Observable<R>);
}
export declare function connectTo<T, R = any>(settings?: ((store: Store<T>) => Observable<R>) | ConnectToSettings<T, R>): (target: any) => void;
//# sourceMappingURL=decorator.d.ts.map