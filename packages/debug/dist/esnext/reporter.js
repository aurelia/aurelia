import { Reporter as RuntimeReporter } from '@aurelia/kernel';
function applyFormat(message, ...params) {
    while (message.includes('%s')) {
        message = message.replace('%s', String(params.shift()));
    }
    return message;
}
export const Reporter = {
    ...RuntimeReporter,
    get level() {
        return RuntimeReporter.level;
    },
    write(code, ...params) {
        const info = getMessageInfoForCode(code);
        const message = `Code ${code}: ${info.message}`;
        switch (info.level) {
            case 3 /* debug */:
                if (this.level >= 3 /* debug */) {
                    console.debug(message, ...params);
                }
                break;
            case 2 /* info */:
                if (this.level >= 2 /* info */) {
                    console.info(message, ...params);
                }
                break;
            case 1 /* warn */:
                if (this.level >= 1 /* warn */) {
                    console.warn(message, ...params);
                }
                break;
            case 0 /* error */: {
                throw this.error(code, ...params);
            }
        }
    },
    error(code, ...params) {
        const info = getMessageInfoForCode(code);
        const error = new Error(`Code ${code}: ${applyFormat(info.message, ...params)}`);
        error.data = params;
        return error;
    }
};
function getMessageInfoForCode(code) {
    const info = codeLookup[code];
    return info !== undefined ? info : createInvalidCodeMessageInfo(code);
}
function createInvalidCodeMessageInfo(code) {
    return {
        level: 0 /* error */,
        message: `Attempted to report with unknown code ${code}.`
    };
}
const codeLookup = {
    0: {
        level: 1 /* warn */,
        message: 'Cannot add observers to object.'
    },
    1: {
        level: 1 /* warn */,
        message: 'Cannot observe property of object.'
    },
    2: {
        level: 2 /* info */,
        message: 'Starting application in debug mode.'
    },
    3: {
        level: 0 /* error */,
        message: 'Runtime expression compilation is only available when including JIT support.'
    },
    4: {
        level: 0 /* error */,
        message: 'Invalid animation direction.'
    },
    5: {
        level: 0 /* error */,
        message: 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
    },
    6: {
        level: 0 /* error */,
        message: 'Invalid resolver strategy specified.'
    },
    7: {
        level: 0 /* error */,
        message: 'Constructor Parameter with index cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
    },
    8: {
        level: 0 /* error */,
        message: 'Self binding behavior only supports events.'
    },
    9: {
        level: 0 /* error */,
        message: 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">'
    },
    10: {
        level: 0 /* error */,
        message: 'The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.'
    },
    11: {
        level: 0 /* error */,
        message: 'Only property bindings and string interpolation bindings can be signaled. Trigger, delegate and call bindings cannot be signaled.'
    },
    12: {
        level: 0 /* error */,
        message: 'Signal name is required.'
    },
    14: {
        level: 0 /* error */,
        message: 'Property cannot be assigned.'
    },
    15: {
        level: 0 /* error */,
        message: 'Unexpected call context.'
    },
    16: {
        level: 0 /* error */,
        message: 'A dependency registration is missing for the interface %s.'
    },
    17: {
        level: 0 /* error */,
        message: 'You can only define one default implementation for an interface.'
    },
    18: {
        level: 0 /* error */,
        message: 'You cannot observe a setter only property.'
    },
    19: {
        level: 0 /* error */,
        message: 'Value for expression is non-repeatable.'
    },
    20: {
        level: 0 /* error */,
        message: 'No template compiler found with the specified name. JIT support or a custom compiler is required.'
    },
    21: {
        level: 0 /* error */,
        message: 'You cannot combine the containerless custom element option with Shadow DOM.'
    },
    22: {
        level: 0 /* error */,
        message: 'A containerless custom element cannot be the root component of an application.'
    },
    30: {
        level: 0 /* error */,
        message: 'There are more targets than there are target instructions.'
    },
    31: {
        level: 0 /* error */,
        message: 'There are more target instructions than there are targets.'
    },
    100: {
        level: 0 /* error */,
        message: 'Invalid start of expression.'
    },
    101: {
        level: 0 /* error */,
        message: 'Unconsumed token.'
    },
    102: {
        level: 0 /* error */,
        message: 'Double dot and spread operators are not supported.'
    },
    103: {
        level: 0 /* error */,
        message: 'Invalid member expression.'
    },
    104: {
        level: 0 /* error */,
        message: 'Unexpected end of expression.'
    },
    105: {
        level: 0 /* error */,
        message: 'Expected identifier.'
    },
    106: {
        level: 0 /* error */,
        message: 'Invalid BindingIdentifier at left hand side of "of".'
    },
    107: {
        level: 0 /* error */,
        message: 'Invalid or unsupported property definition in object literal.'
    },
    108: {
        level: 0 /* error */,
        message: 'Unterminated quote in string literal.'
    },
    109: {
        level: 0 /* error */,
        message: 'Unterminated template string.'
    },
    110: {
        level: 0 /* error */,
        message: 'Missing expected token.'
    },
    111: {
        level: 0 /* error */,
        message: 'Unexpected character.'
    },
    150: {
        level: 0 /* error */,
        message: 'Left hand side of expression is not assignable.'
    },
    151: {
        level: 0 /* error */,
        message: 'Unexpected keyword "of"'
    },
    401: {
        level: 1 /* warn */,
        message: `AttributePattern is missing a handler for '%s'.`
    },
    402: {
        level: 1 /* warn */,
        message: `AttributePattern handler for '%s' is not a function.`
    },
    800: {
        level: 0 /* error */,
        message: `Property '%s' is being dirty-checked.`
    },
    801: {
        level: 1 /* warn */,
        message: `Property '%s' is being dirty-checked.`
    },
    2000: {
        level: 0 /* error */,
        message: 'Router has not been activated.'
    },
    2001: {
        level: 0 /* error */,
        message: 'Router has already been activated.'
    },
    2002: {
        level: 0 /* error */,
        message: 'Failed to resolve all viewports.'
    },
    2003: {
        level: 0 /* error */,
        message: 'Browser navigation has already been activated.'
    },
    2004: {
        level: 0 /* error */,
        message: 'LinkHandler has already been activated.'
    },
    1001: {
        level: 2 /* info */,
        message: 'DOM already initialized. Destroying and re-initializing..'
    },
    10000: {
        level: 3 /* debug */,
        message: '%s'
    }
};
//# sourceMappingURL=reporter.js.map