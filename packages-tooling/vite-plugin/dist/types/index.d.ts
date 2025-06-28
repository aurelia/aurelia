import { IOptionalPreprocessOptions } from '@aurelia/plugin-conventions';
import { FilterPattern } from '@rollup/pluginutils';
export default function au(options?: {
    include?: FilterPattern;
    exclude?: FilterPattern;
    pre?: boolean;
    /**
     * Indiciates whether the plugin should alias aurelia packages to the dev bundle.
     */
    useDev?: boolean;
} & IOptionalPreprocessOptions): import("vite").Plugin<any>[];
//# sourceMappingURL=index.d.ts.map