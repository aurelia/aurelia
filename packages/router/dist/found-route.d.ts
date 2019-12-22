import { IRoute } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
export declare class FoundRoute {
    match: IRoute | null;
    matching: string;
    instructions: ViewportInstruction[];
    remaining: string;
    constructor(match?: IRoute | null, matching?: string, instructions?: ViewportInstruction[], remaining?: string);
    get foundConfiguration(): boolean;
    get foundInstructions(): boolean;
    get hasRemaining(): boolean;
}
//# sourceMappingURL=found-route.d.ts.map