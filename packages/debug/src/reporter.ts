import { Reporter as RuntimeReporter } from '@aurelia/kernel';

const enum MessageType {
  error,
  warn,
  info,
  debug
}

interface IMessageInfo {
  message: string;
  // tslint:disable-next-line:no-reserved-keywords
  type: MessageType;
}

export const Reporter: typeof RuntimeReporter = {...RuntimeReporter,
  write(code: number, ...params: any[]): void {
    const info = getMessageInfoForCode(code);

    switch (info.type) {
      case MessageType.debug:
        console.debug(info.message, ...params);
        break;
      case MessageType.info:
        console.info(info.message, ...params);
        break;
      case MessageType.warn:
        console.warn(info.message, ...params);
        break;
      case MessageType.error:
        throw this.error(code, ...params);
    }
  },
  error(code: number, ...params: any[]): Error {
    const info = getMessageInfoForCode(code);
    const error = new Error(info.message);
    (<any>error).data = params;
    return error;
  }};

function getMessageInfoForCode(code: number): IMessageInfo {
  return codeLookup[code] || createInvalidCodeMessageInfo(code);
}

function createInvalidCodeMessageInfo(code: number): IMessageInfo {
  return {
    type: MessageType.error,
    message: `Attempted to report with unknown code ${code}.`
  };
}

const codeLookup: Record<string, IMessageInfo> = {
  0: {
    type: MessageType.warn,
    message: 'Cannot add observers to object.'
  },
  1: {
    type: MessageType.warn,
    message: 'Cannot observe property of object.'
  },
  2: {
    type: MessageType.info,
    message: 'Starting application in debug mode.'
  },
  3: {
    type: MessageType.error,
    message: 'Runtime expression compilation is only available when including JIT support.'
  },
  4: {
    type: MessageType.error,
    message: 'Invalid animation direction.'
  },
  5: {
    type: MessageType.error,
    message: 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
  },
  6: {
    type: MessageType.error,
    message: 'Invalid resolver strategy specified.'
  },
  7: {
    type: MessageType.error,
    message: 'Constructor Parameter with index cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
  },
  8: {
    type: MessageType.error,
    message: 'Self binding behavior only supports events.'
  },
  9: {
    type: MessageType.error,
    message: 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">'
  },
  10: {
    type: MessageType.error,
    message: 'The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.'
  },
  11: {
    type: MessageType.error,
    message: 'Only property bindings and string interpolation bindings can be signaled. Trigger, delegate and call bindings cannot be signaled.'
  },
  12: {
    type: MessageType.error,
    message: 'Signal name is required.'
  },
  14: {
    type: MessageType.error,
    message: 'Property cannot be assigned.'
  },
  15: {
    type: MessageType.error,
    message: 'Unexpected call context.'
  },
  16: {
    type: MessageType.error,
    message: 'Only one child observer per content view is supported for the life of the content view.'
  },
  17: {
    type: MessageType.error,
    message: 'You can only define one default implementation for an interface.'
  },
  18: {
    type: MessageType.error,
    message: 'You cannot observe a setter only property.'
  },
  19: {
    type: MessageType.error,
    message: 'Value for expression is non-repeatable.'
  },
  20: {
    type: MessageType.error,
    message: 'No template compiler found with the specified name. JIT support or a custom compiler is required.'
  },
  21: {
    type: MessageType.error,
    message: 'You cannot combine the containerless custom element option with Shadow DOM.'
  },
  22: {
    type: MessageType.error,
    message: 'A containerless custom element cannot be the root component of an application.'
  },
  30: {
    type: MessageType.error,
    message: 'There are more targets than there are target instructions.'
  },
  31: {
    type: MessageType.error,
    message: 'There are more target instructions than there are targets.'
  },
  100: {
    type: MessageType.error,
    message: 'Invalid start of expression.'
  },
  101: {
    type: MessageType.error,
    message: 'Unconsumed token.'
  },
  102: {
    type: MessageType.error,
    message: 'Double dot and spread operators are not supported.'
  },
  103: {
    type: MessageType.error,
    message: 'Invalid member expression.'
  },
  104: {
    type: MessageType.error,
    message: 'Unexpected end of expression.'
  },
  105: {
    type: MessageType.error,
    message: 'Expected identifier.'
  },
  106: {
    type: MessageType.error,
    message: 'Invalid BindingIdentifier at left hand side of "of".'
  },
  107: {
    type: MessageType.error,
    message: 'Invalid or unsupported property definition in object literal.'
  },
  108: {
    type: MessageType.error,
    message: 'Unterminated quote in string literal.'
  },
  109: {
    type: MessageType.error,
    message: 'Unterminated template string.'
  },
  110: {
    type: MessageType.error,
    message: 'Missing expected token.'
  },
  111: {
    type: MessageType.error,
    message: 'Unexpected character.'
  },
  150: {
    type: MessageType.error,
    message: 'Left hand side of expression is not assignable.'
  },
  151: {
    type: MessageType.error,
    message: 'Unexpected keyword "of"'
  }
};
