import { Reporter as RuntimeReporter } from '@aurelia/kernel';

const enum MessageType {
  error,
  warn,
  info,
  debug
}

interface IMessageInfo {
  message: string;
  messageType: MessageType;
}

export const Reporter: typeof RuntimeReporter = {...RuntimeReporter,
  write(code: number, ...params: unknown[]): void {
    const info = getMessageInfoForCode(code);

    // tslint:disable:no-console
    switch (info.messageType) {
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
    // tslint:enable:no-console
  },
  error(code: number, ...params: unknown[]): Error {
    const info = getMessageInfoForCode(code);
    const error = new Error(info.message);
    (<Error & {data: unknown}>error).data = params;
    return error;
  }};

function getMessageInfoForCode(code: number): IMessageInfo {
  return codeLookup[code] || createInvalidCodeMessageInfo(code);
}

function createInvalidCodeMessageInfo(code: number): IMessageInfo {
  return {
    messageType: MessageType.error,
    message: `Attempted to report with unknown code ${code}.`
  };
}

const codeLookup: Record<string, IMessageInfo> = {
  0: {
    messageType: MessageType.warn,
    message: 'Cannot add observers to object.'
  },
  1: {
    messageType: MessageType.warn,
    message: 'Cannot observe property of object.'
  },
  2: {
    messageType: MessageType.info,
    message: 'Starting application in debug mode.'
  },
  3: {
    messageType: MessageType.error,
    message: 'Runtime expression compilation is only available when including JIT support.'
  },
  4: {
    messageType: MessageType.error,
    message: 'Invalid animation direction.'
  },
  5: {
    messageType: MessageType.error,
    message: 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
  },
  6: {
    messageType: MessageType.error,
    message: 'Invalid resolver strategy specified.'
  },
  7: {
    messageType: MessageType.error,
    message: 'Constructor Parameter with index cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
  },
  8: {
    messageType: MessageType.error,
    message: 'Self binding behavior only supports events.'
  },
  9: {
    messageType: MessageType.error,
    message: 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">'
  },
  10: {
    messageType: MessageType.error,
    message: 'The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.'
  },
  11: {
    messageType: MessageType.error,
    message: 'Only property bindings and string interpolation bindings can be signaled. Trigger, delegate and call bindings cannot be signaled.'
  },
  12: {
    messageType: MessageType.error,
    message: 'Signal name is required.'
  },
  14: {
    messageType: MessageType.error,
    message: 'Property cannot be assigned.'
  },
  15: {
    messageType: MessageType.error,
    message: 'Unexpected call context.'
  },
  16: {
    messageType: MessageType.error,
    message: 'Only one child observer per content view is supported for the life of the content view.'
  },
  17: {
    messageType: MessageType.error,
    message: 'You can only define one default implementation for an interface.'
  },
  18: {
    messageType: MessageType.error,
    message: 'You cannot observe a setter only property.'
  },
  19: {
    messageType: MessageType.error,
    message: 'Value for expression is non-repeatable.'
  },
  20: {
    messageType: MessageType.error,
    message: 'No template compiler found with the specified name. JIT support or a custom compiler is required.'
  },
  21: {
    messageType: MessageType.error,
    message: 'You cannot combine the containerless custom element option with Shadow DOM.'
  },
  22: {
    messageType: MessageType.error,
    message: 'A containerless custom element cannot be the root component of an application.'
  },
  30: {
    messageType: MessageType.error,
    message: 'There are more targets than there are target instructions.'
  },
  31: {
    messageType: MessageType.error,
    message: 'There are more target instructions than there are targets.'
  },
  100: {
    messageType: MessageType.error,
    message: 'Invalid start of expression.'
  },
  101: {
    messageType: MessageType.error,
    message: 'Unconsumed token.'
  },
  102: {
    messageType: MessageType.error,
    message: 'Double dot and spread operators are not supported.'
  },
  103: {
    messageType: MessageType.error,
    message: 'Invalid member expression.'
  },
  104: {
    messageType: MessageType.error,
    message: 'Unexpected end of expression.'
  },
  105: {
    messageType: MessageType.error,
    message: 'Expected identifier.'
  },
  106: {
    messageType: MessageType.error,
    message: 'Invalid BindingIdentifier at left hand side of "of".'
  },
  107: {
    messageType: MessageType.error,
    message: 'Invalid or unsupported property definition in object literal.'
  },
  108: {
    messageType: MessageType.error,
    message: 'Unterminated quote in string literal.'
  },
  109: {
    messageType: MessageType.error,
    message: 'Unterminated template string.'
  },
  110: {
    messageType: MessageType.error,
    message: 'Missing expected token.'
  },
  111: {
    messageType: MessageType.error,
    message: 'Unexpected character.'
  },
  150: {
    messageType: MessageType.error,
    message: 'Left hand side of expression is not assignable.'
  },
  151: {
    messageType: MessageType.error,
    message: 'Unexpected keyword "of"'
  }
};
