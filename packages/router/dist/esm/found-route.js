/**
 * @internal - Used when founding route/instructions
 */
export class FoundRoute {
    constructor(match = null, matching = '', instructions = [], remaining = '', 
    // public remaining: string | null = null,
    params = {}) {
        this.match = match;
        this.matching = matching;
        this.instructions = instructions;
        this.remaining = remaining;
        this.params = params;
    }
    get foundConfiguration() {
        return this.match !== null;
    }
    get foundInstructions() {
        return this.instructions.length > 0;
    }
    get hasRemaining() {
        return this.remaining !== null && this.remaining.length > 0;
    }
}
//# sourceMappingURL=found-route.js.map