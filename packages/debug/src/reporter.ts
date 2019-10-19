import { LogLevel, Reporter as RuntimeReporter } from '@aurelia/kernel';

declare let console: {
  log(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};

interface IMessageInfo {
  message: string;
  level: LogLevel;
}

function applyFormat(message: string, ...params: unknown[]): string {
  while (message.includes('%s')) {
    message = message.replace('%s', String(params.shift()));
  }
  return message;
}

export const Reporter: typeof RuntimeReporter = {
  ...RuntimeReporter,
  get level() {
    return RuntimeReporter.level;
  },
  write(code: number, ...params: unknown[]): void {
    const info = getMessageInfoForCode(code);
    const message = `Code ${code}: ${info.message}`;

    switch (info.level) {
      case LogLevel.debug:
        if (this.level >= LogLevel.debug) {
          console.debug(message, ...params);
        }
        break;
      case LogLevel.info:
        if (this.level >= LogLevel.info) {
          console.info(message, ...params);
        }
        break;
      case LogLevel.warn:
        if (this.level >= LogLevel.warn) {
          console.warn(message, ...params);
        }
        break;
      case LogLevel.error: {
        throw this.error(code, ...params);
      }
    }
  },
  error(code: number, ...params: unknown[]): Error {
    const info = getMessageInfoForCode(code);
    const error = new Error(`Code ${code}: ${applyFormat(info.message, ...params)}`);
    (error as Error & { data: unknown[] }).data = params;
    return error;
  }
};

function getMessageInfoForCode(code: number): IMessageInfo {
  const info = codeLookup[code];
  return info !== undefined ? info : createInvalidCodeMessageInfo(code);
}

function createInvalidCodeMessageInfo(code: number): IMessageInfo {
  return {
    level: LogLevel.error,
    message: `Attempted to report with unknown code ${code}.`
  };
}

const codeLookup: Record<string, IMessageInfo> = {
  0: {
    level: LogLevel.warn,
    message: 'Cannot add observers to object.'
  },
  1: {
    level: LogLevel.warn,
    message: 'Cannot observe property of object.'
  },
  2: {
    level: LogLevel.info,
    message: 'Starting application in debug mode.'
  },
  3: {
    level: LogLevel.error,
    message: 'Runtime expression compilation is only available when including JIT support.'
  },
  4: {
    level: LogLevel.error,
    message: 'Invalid animation direction.'
  },
  5: {
    level: LogLevel.error,
    message: 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
  },
  6: {
    level: LogLevel.error,
    message: 'Invalid resolver strategy specified.'
  },
  7: {
    level: LogLevel.error,
    message: 'Constructor Parameter with index cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
  },
  8: {
    level: LogLevel.error,
    message: 'Self binding behavior only supports events.'
  },
  9: {
    level: LogLevel.error,
    message: 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">'
  },
  10: {
    level: LogLevel.error,
    message: 'The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.'
  },
  11: {
    level: LogLevel.error,
    message: 'Only property bindings and string interpolation bindings can be signaled. Trigger, delegate and call bindings cannot be signaled.'
  },
  12: {
    level: LogLevel.error,
    message: 'Signal name is required.'
  },
  14: {
    level: LogLevel.error,
    message: 'Property cannot be assigned.'
  },
  15: {
    level: LogLevel.error,
    message: 'Unexpected call context.'
  },
  16: {
    level: LogLevel.error,
    message: 'A dependency registration is missing for the interface %s.'
  },
  17: {
    level: LogLevel.error,
    message: 'You can only define one default implementation for an interface.'
  },
  18: {
    level: LogLevel.error,
    message: 'You cannot observe a setter only property.'
  },
  19: {
    level: LogLevel.error,
    message: 'Value for expression is non-repeatable.'
  },
  20: {
    level: LogLevel.error,
    message: 'No template compiler found with the specified name. JIT support or a custom compiler is required.'
  },
  21: {
    level: LogLevel.error,
    message: 'You cannot combine the containerless custom element option with Shadow DOM.'
  },
  22: {
    level: LogLevel.error,
    message: 'A containerless custom element cannot be the root component of an application.'
  },
  30: {
    level: LogLevel.error,
    message: 'There are more targets than there are target instructions.'
  },
  31: {
    level: LogLevel.error,
    message: 'There are more target instructions than there are targets.'
  },
  100: {
    level: LogLevel.error,
    message: 'Invalid start of expression.'
  },
  101: {
    level: LogLevel.error,
    message: 'Unconsumed token.'
  },
  102: {
    level: LogLevel.error,
    message: 'Double dot and spread operators are not supported.'
  },
  103: {
    level: LogLevel.error,
    message: 'Invalid member expression.'
  },
  104: {
    level: LogLevel.error,
    message: 'Unexpected end of expression.'
  },
  105: {
    level: LogLevel.error,
    message: 'Expected identifier.'
  },
  106: {
    level: LogLevel.error,
    message: 'Invalid BindingIdentifier at left hand side of "of".'
  },
  107: {
    level: LogLevel.error,
    message: 'Invalid or unsupported property definition in object literal.'
  },
  108: {
    level: LogLevel.error,
    message: 'Unterminated quote in string literal.'
  },
  109: {
    level: LogLevel.error,
    message: 'Unterminated template string.'
  },
  110: {
    level: LogLevel.error,
    message: 'Missing expected token.'
  },
  111: {
    level: LogLevel.error,
    message: 'Unexpected character.'
  },
  150: {
    level: LogLevel.error,
    message: 'Left hand side of expression is not assignable.'
  },
  151: {
    level: LogLevel.error,
    message: 'Unexpected keyword "of"'
  },
  401: {
    level: LogLevel.warn,
    message: `AttributePattern is missing a handler for '%s'.`
  },
  402: {
    level: LogLevel.warn,
    message: `AttributePattern handler for '%s' is not a function.`
  },
  800: {
    level: LogLevel.error,
    message: `Property '%s' is being dirty-checked.`
  },
  801: {
    level: LogLevel.warn,
    message: `Property '%s' is being dirty-checked.`
  },
  2000: {
    level: LogLevel.error,
    message: 'Router has not been activated.'
  },
  2001: {
    level: LogLevel.error,
    message: 'Router has already been activated.'
  },
  2002: {
    level: LogLevel.error,
    message: 'Failed to resolve all viewports.'
  },
  2003: {
    level: LogLevel.error,
    message: 'Browser navigation has already been activated.'
  },
  2004: {
    level: LogLevel.error,
    message: 'LinkHandler has already been activated.'
  },
  1001: {
    level: LogLevel.info,
    message: 'DOM already initialized. Destroying and re-initializing..'
  },
  10000: {
    level: LogLevel.debug,
    message: '%s'
  }
};
