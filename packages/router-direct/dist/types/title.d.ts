import { TitleOptions } from './router-options';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Navigation } from './navigation';
export declare class Title {
    static getTitle(instructions: RoutingInstruction[], navigation: Navigation, titleOptions: TitleOptions): Promise<string | null>;
    private static stringifyTitles;
    private static stringifyTitle;
    private static resolveTitle;
}
//# sourceMappingURL=title.d.ts.map