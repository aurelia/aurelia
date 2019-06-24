import { DI } from '@aurelia/kernel';
export const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer').withDefault(x => x.singleton(class {
    isStandardSvgAttribute(node, attributeName) {
        return false;
    }
}));
//# sourceMappingURL=svg-analyzer.js.map