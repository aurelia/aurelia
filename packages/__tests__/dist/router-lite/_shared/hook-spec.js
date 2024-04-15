function getHookSpecs(name) {
    return {
        sync: {
            name,
            type: 'sync',
            ticks: 0,
            invoke(_vm, getValue) {
                return getValue();
            },
        },
        async(count) {
            return {
                name,
                type: `async${count}`,
                ticks: count,
                invoke(_vm, getValue) {
                    const value = getValue();
                    let i = -1;
                    function next() {
                        if (++i < count) {
                            return Promise.resolve().then(next);
                        }
                        return value;
                    }
                    return next();
                },
            };
        },
    };
}
export const hookSpecsMap = {
    binding: getHookSpecs('binding'),
    bound: getHookSpecs('bound'),
    attaching: getHookSpecs('attaching'),
    attached: getHookSpecs('attached'),
    detaching: getHookSpecs('detaching'),
    unbinding: getHookSpecs('unbinding'),
    dispose: getHookSpecs('dispose').sync,
    canLoad: getHookSpecs('canLoad'),
    loading: getHookSpecs('loading'),
    canUnload: getHookSpecs('canUnload'),
    unloading: getHookSpecs('unloading'),
};
function groupByPrefix(list) {
    const groups = {};
    for (let i = 0; i < list.length; ++i) {
        const item = list[i];
        const prefix = item.slice(0, item.indexOf('.'));
        (groups[prefix] ??= []).push(item);
    }
    return groups;
}
export function verifyInvocationsEqual(actual, expected) {
    const errors = [];
    const expectedGroups = groupByPrefix(expected);
    const actualGroups = groupByPrefix(actual);
    for (const prefix in expectedGroups) {
        expected = expectedGroups[prefix];
        actual = actualGroups[prefix] ?? [];
        const len = Math.max(actual.length, expected.length);
        for (let i = 0; i < len; ++i) {
            const $actual = actual[i];
            const $expected = expected[i];
            if ($actual === $expected) {
                errors.push(`    OK : ${$actual}`);
            }
            else {
                errors.push(`NOT OK : ${$actual} (expected: ${$expected})`);
            }
        }
    }
    if (errors.some(e => e.startsWith('N'))) {
        throw new Error(`Failed assertion: invocation mismatch\n  - ${errors.join('\n  - ')})`);
    }
}
//# sourceMappingURL=hook-spec.js.map