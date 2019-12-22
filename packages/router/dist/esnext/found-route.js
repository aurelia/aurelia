export class FoundRoute {
    constructor(match = null, matching = '', instructions = [], remaining = '') {
        this.match = match;
        this.matching = matching;
        this.instructions = instructions;
        this.remaining = remaining;
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