import { Reporter as RuntimeReporter } from '../runtime/reporter';

enum MessageType {
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
  }
};
