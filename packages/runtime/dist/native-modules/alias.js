import { Protocol, Metadata, Registration } from '../../../kernel/dist/native-modules/index.js';
export function alias(...aliases) {
    return function (target) {
        const key = Protocol.annotation.keyFor('aliases');
        const existing = Metadata.getOwn(key, target);
        if (existing === void 0) {
            Metadata.define(key, aliases, target);
        }
        else {
            existing.push(...aliases);
        }
    };
}
export function registerAliases(aliases, resource, key, container) {
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
    }
}
//# sourceMappingURL=alias.js.map