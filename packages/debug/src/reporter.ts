import { Reporter as RuntimeReporter } from '@aurelia/kernel';

const enum MessageType {
  error,
  warn,
  info,
  debug
}

interface IMessageInfo {
  message: string;
  type: MessageType;
}

export const Reporter: typeof RuntimeReporter = Object.assign(RuntimeReporter, {
  write(code: number, ...params: any[]): void {
    let info = getMessageInfoForCode(code);

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
    let info = getMessageInfoForCode(code);
    let error = new Error(info.message);
    (<any>error).data = params;
    return error;
  }
});

function getMessageInfoForCode(code: number): IMessageInfo {
  return codeLookup[code] || createInvalidCodeMessageInfo(code);
}

function createInvalidCodeMessageInfo(code: number) {
  return {
    type: MessageType.error,
    message: `Attempted to report with unknown code ${code}.`
  };
};

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
  13: {
    type: MessageType.error,
    message: 'TaskQueue long stack traces are only available in debug mode.'
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
  }
};
