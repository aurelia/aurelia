import { RoutingInstruction } from './routing-instruction';
import { Separators } from '../router-options';
export declare class InstructionParser {
    static parse(seps: Separators, instructions: string, grouped: boolean, topScope: boolean): {
        instructions: RoutingInstruction[];
        remaining: string;
    };
    private static isAdd;
    private static parseOne;
    private static findNextToken;
}
//# sourceMappingURL=instruction-parser.d.ts.map