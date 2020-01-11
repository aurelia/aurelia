import { EventEmitter } from 'events';

import { Socket } from 'net';
import { createHash } from 'crypto';
import { IncomingMessage } from 'http';
import { PLATFORM } from '@aurelia/kernel';

const EMPTY_BUFFER = Buffer.alloc(0);

const enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export class WebSocket extends EventEmitter {
  public readyState: ReadyState = ReadyState.CONNECTING;
  public protocol: string = '';

  public closeTimer: NodeJS.Timeout | null = null;

  private closeFrameReceived: boolean = false;
  private closeFrameSent: boolean = false;
  private closeMessage: string = '';
  private closeCode: number = 1006;

  public constructor(
    req: IncomingMessage,
    public readonly socket: Socket,
    head: Buffer,
  ) {
    super();

    const socketOnData = (buffer: Buffer) => {
      let cursor = 0;

      const opcode = buffer[cursor] & 0x0f;
      let payloadLength = buffer[cursor + 1] & 0x7f;
      const masked = (buffer[cursor + 1] & 0x80) === 0x80;

      cursor += 2;

      switch (payloadLength) {
        case 126:
          payloadLength = buffer.readUInt16BE(cursor);
          cursor += 2;
          break;
        case 127:
          payloadLength = buffer.readUInt32BE(cursor) * 0x100000000 + buffer.readUInt32BE(cursor + 4);
          cursor += 8;
          break;
      }

      let data = EMPTY_BUFFER;

      if (payloadLength > 0) {
        if (masked) {
          data = buffer.slice(cursor + 4, cursor + 4 + payloadLength);

          switch (payloadLength) {
            case 4:
              data[3] ^= buffer[cursor + 3];
              // falls through
            case 3:
              data[2] ^= buffer[cursor + 2];
              // falls through
            case 2:
              data[1] ^= buffer[cursor + 1];
              // falls through
            case 1:
              data[0] ^= buffer[cursor];
              break;
            default: {
              const m0 = buffer[cursor];
              const m1 = buffer[cursor + 1];
              const m2 = buffer[cursor + 2];
              const m3 = buffer[cursor + 3];

              const len3 = payloadLength % 4;
              const len4 = payloadLength - len3;
              let i = 0;
              for (; i < len4; i += 4) {
                data[i] ^= m0;
                data[i + 1] ^= m1;
                data[i + 2] ^= m2;
                data[i + 3] ^= m3;
              }

              switch (len3) {
                case 3:
                  data[i + 2] ^= m2;
                  // falls through
                case 2:
                  data[i + 1] ^= m1;
                  // falls through
                case 1:
                  data[i] ^= m0;
                  break;
              }
            }
          }
        } else {
          data = buffer.slice(cursor, cursor + payloadLength);
        }
      }

      switch (opcode) {
        case 1:
          this.emit('message', data.toString());
          break;
        case 2:
          this.emit('message', data);
          break;
        case 8: {
          let code: number;
          let reason: string;
          if (data.length === 0) {
            code = 1005;
            reason = '';
          } else {
            code = data.readUInt16BE(0);
            reason = data.slice(2).toString();
          }

          this.socket.removeListener('data', socketOnData);
          this.socket.resume();

          this.closeFrameReceived = true;
          this.closeMessage = reason;
          this.closeCode = code;

          if (code === 1005) {
            this.close();
          } else {
            this.close(code, reason);
          }
          break;
        }
      }
    };

    const socketOnError = () => {
      this.readyState = ReadyState.CLOSING;

      socket.removeListener('error', socketOnError);
      socket.on('error', PLATFORM.noop);

      socket.destroy();
    };

    const socketOnEnd = () => {
      this.readyState = ReadyState.CLOSING;

      socket.end();
    };

    const socketOnClose = () => {
      this.readyState = ReadyState.CLOSING;

      socket.removeListener('close', socketOnClose);
      socket.removeListener('end', socketOnEnd);

      socket.read();

      socket.removeListener('data', socketOnData);

      clearTimeout(this.closeTimer!);

      this.emitClose();
    };

    socket.on('error', socketOnError);

    const digest = createHash('sha1').update(`${(req.headers['sec-websocket-key'] as string).trim()}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');

    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${digest}\r\n\r\n`);
    socket.removeListener('error', socketOnError);

    socket.setTimeout(0);
    socket.setNoDelay();

    if (head.length > 0) {
      socket.unshift(head);
    }

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);

    this.readyState = ReadyState.OPEN;
  }

  public emitClose(): void {
    this.readyState = ReadyState.CLOSING;

    this.emit('close', this.closeCode, this.closeMessage);
  }

  public close(
    code?: number,
    data?: string,
  ): void {
    switch (this.readyState) {
      case ReadyState.CLOSED:
        return;
      case ReadyState.CONNECTING:
        throw new Error('WebSocket was closed before the connection was established');
      case ReadyState.CLOSING:
        if (this.closeFrameSent && this.closeFrameReceived) {
          this.socket.end();
        }
        return;
    }

    this.readyState = ReadyState.CLOSING;

    let buf: Buffer;

    if (code === void 0) {
      buf = EMPTY_BUFFER;
    } else if (data === void 0 || data === '') {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      buf = Buffer.allocUnsafe(2 + Buffer.byteLength(data));
      buf.writeUInt16BE(code, 0);
      buf.write(data, 2);
    }

    this.sendFrame(buf, 8, (err) => {
      if (err !== void 0) {
        return;
      }

      this.closeFrameSent = true;
      if (this.closeFrameReceived) {
        this.socket.end();
      }
    });

    this.closeTimer = setTimeout(
      () => this.socket.destroy(),
      30000,
    );
  }

  public send(data: Buffer): void {
    this.sendFrame(data, 2);
  }

  public sendFrame(
    data: Buffer,
    opcode: number,
    cb?: (err?: Error) => void,
  ): void {

    let offset = 2;
    let payloadLength = data.length;

    if (data.length >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (data.length > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(offset);

    target[0] = opcode | 0x80;
    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(data.length, 2);
    } else if (payloadLength === 127) {
      target.writeUInt32BE(0, 2);
      target.writeUInt32BE(data.length, 6);
    }

    this.socket.cork();
    this.socket.write(target);
    this.socket.write(data, cb);
    this.socket.uncork();
  }
}
