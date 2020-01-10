import { EventEmitter } from 'events';

import { Socket } from 'net';
import { Writable } from 'stream';
import { createHash } from 'crypto';
import { IncomingMessage } from 'http';
import { PLATFORM } from '@aurelia/kernel';

const EMPTY_BUFFER = Buffer.alloc(0);

function isValidStatusCode(code: number): boolean {
  return (
    (code >= 1000 &&
      code <= 1013 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

const enum State {
  GET_INFO = 0,
  GET_PAYLOAD_LENGTH_16 = 1,
  GET_PAYLOAD_LENGTH_64 = 2,
  GET_DATA = 3,
}

class Receiver extends Writable {
  private _bufferedBytes: number = 0;
  private _buffers: Buffer[] = [];

  private _payloadLength: number = 0;
  private _opcode: number = 0;

  private _state: State = State.GET_INFO;
  private _loop: boolean = false;

  public constructor(
    public ws: WebSocket,
  ) {
    super();
  }

  public _write(chunk: Buffer, encoding: string, cb: (err?: Error) => void): void {
    if (this._opcode === 0x08 && this._state === State.GET_INFO) {
      return cb();
    }

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }

  public consume(n: number): Buffer {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) {
      return this._buffers.shift()!;
    }

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = buf.slice(n);
      return buf.slice(0, n);
    }

    const dst = Buffer.allocUnsafe(n);

    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;

      if (n >= buf.length) {
        dst.set(this._buffers.shift()!, offset);
      } else {
        // eslint-disable-next-line compat/compat
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = buf.slice(n);
      }

      n -= buf.length;
    } while (n > 0);

    return dst;
  }

  public startLoop(cb: (err?: Error) => void): void {
    let err: WSRangeError | void;
    this._loop = true;

    do {
      switch (this._state) {
        case State.GET_INFO: {
          if (this._bufferedBytes < 2) {
            this._loop = false;
            break;
          }

          const buf = this.consume(2);

          if ((buf[0] & 0x30) !== 0x00) {
            this._loop = false;
            err = new WSRangeError('RSV2 and RSV3 must be clear', 1002);
            break;
          }

          this._opcode = buf[0] & 0x0f;
          this._payloadLength = buf[1] & 0x7f;

          if (this._opcode === 0x00) {
            this._loop = false;
            err = new WSRangeError('invalid opcode 0', 1002);
            break;
          } else if (this._opcode === 0x01 || this._opcode === 0x02) {
            // do nothing
          } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
            if (this._payloadLength > 0x7d) {
              this._loop = false;
              err = new WSRangeError(`invalid payload length ${this._payloadLength}`, 1002);
              break;
            }
          } else {
            this._loop = false;
            err = new WSRangeError(`invalid opcode ${this._opcode}`, 1002);
            break;
          }

          if (this._payloadLength === 126) {
            this._state = State.GET_PAYLOAD_LENGTH_16;
          } else if (this._payloadLength === 127) {
            this._state = State.GET_PAYLOAD_LENGTH_64;
          } else {
            this._state = State.GET_DATA;
          }
          break;
        }
        case State.GET_PAYLOAD_LENGTH_16: {
          if (this._bufferedBytes < 2) {
            this._loop = false;
            break;
          }

          this._payloadLength = this.consume(2).readUInt16BE(0);
          this._state = State.GET_DATA;
          break;
        }
        case State.GET_PAYLOAD_LENGTH_64: {
          if (this._bufferedBytes < 8) {
            this._loop = false;
            break;
          }

          const buf = this.consume(8);
          const num = buf.readUInt32BE(0);

          this._payloadLength = num * 2 ** 32 + buf.readUInt32BE(4);
          this._state = State.GET_DATA;
          break;
        }
        case State.GET_DATA: {
          let data = EMPTY_BUFFER;

          if (this._payloadLength > 0) {
            if (this._bufferedBytes < this._payloadLength) {
              this._loop = false;
              return;
            }

            data = this.consume(this._payloadLength);
          }

          if (this._opcode > 0x07) {
            if (this._opcode === 0x08) {
              this._loop = false;

              if (data.length === 0) {
                this.conclude(1005, '');
              } else if (data.length === 1) {
                err = new WSRangeError('invalid payload length 1', 1002);
                break;
              } else {
                const code = data.readUInt16BE(0);

                if (!isValidStatusCode(code)) {
                  err = new WSRangeError(`invalid status code ${code}`, 1002);
                  break;
                }

                this.conclude(code, data.slice(2).toString());
              }
            } else if (this._opcode === 0x09) {
              console.log('ping', data);
            } else {
              console.log('pong', data);
            }

            this._state = State.GET_INFO;
            break;
          }

          if (this._opcode === 2) {
            this.ws.emit('message', data);
          } else {
            this.ws.emit('message', data.toString());
          }

          this._state = State.GET_INFO;
          break;
        }
      }
    } while (this._loop);

    cb(err as Error | undefined);
  }

  public conclude(
    code: number,
    reason: string,
  ): void {
    const ws = this.ws;

    ws.conclude(code, reason);

    if (code === 1005) {
      ws.close();
    } else {
      ws.close(code, reason);
    }

    this.end();
  }
}

class WSRangeError extends RangeError {
  public constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(`Invalid WebSocket frame: ${message}`);
    Error.captureStackTrace(this, WSRangeError);
  }
}

class Sender {
  public _bufferedBytes: number = 0;

  public constructor(
    private readonly _socket: Socket,
  ) {}

  public close(
    code: number | undefined,
    data: string | undefined,
    cb?: (err?: Error) => void,
  ): void {
    let buf: Buffer;

    if (code === void 0) {
      buf = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === void 0 || data === '') {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      buf = Buffer.allocUnsafe(2 + Buffer.byteLength(data));
      buf.writeUInt16BE(code, 0);
      buf.write(data, 2);
    }

    this.sendFrame(buf, 0x08, cb);
  }

  public send(data: Buffer) {
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

    this._socket.cork();
    this._socket.write(target);
    this._socket.write(data, cb);
    this._socket.uncork();
  }
}

export class WebSocket extends EventEmitter {
  public static CONNECTING: 0 = 0;
  public static OPEN: 1 = 1;
  public static CLOSING: 2 = 2;
  public static CLOSED: 3 = 3;

  public readyState: number = WebSocket.CONNECTING;
  public protocol: string = '';

  public _receiver: Receiver = null!;
  public _closeTimer: NodeJS.Timeout | null = null;
  public _socket: Socket = null!;

  private _closeFrameReceived: boolean = false;
  private _closeFrameSent: boolean = false;
  private _closeMessage: string = '';
  private _closeCode: number = 1006;
  private readonly _sender: Sender;

  public get CONNECTING(): number {
    return WebSocket.CONNECTING;
  }
  public get CLOSING(): number {
    return WebSocket.CLOSING;
  }
  public get CLOSED(): number {
    return WebSocket.CLOSED;
  }
  public get OPEN(): number {
    return WebSocket.OPEN;
  }

  public constructor(
    req: IncomingMessage,
    socket: Socket,
    head: Buffer,
  ) {
    super();

    socket.on('error', socketOnError);

    const payload = `${(req.headers['sec-websocket-key'] as string).trim()}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`;
    const digest = createHash('sha1').update(payload).digest('base64');

    let header = `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${digest}`;
    let protocol = req.headers['sec-websocket-protocol'];

    if (protocol !== void 0 && protocol.length > 0) {
      [protocol] = (protocol as string).trim().split(/ *, */);

      if (protocol.length > 0) {
        header = `${header}\r\nSec-WebSocket-Protocol: ${protocol}`;
        this.protocol = protocol;
      }
    }

    socket.write(`${header}\r\n\r\n`);
    socket.removeListener('error', socketOnError);

    const receiver = new Receiver(this);

    this._sender = new Sender(socket);
    this._receiver = receiver;
    this._socket = socket;

    wsLookup.set(socket, this);

    receiver.on('drain', () => socket.resume());
    receiver.on('error', (err: WSRangeError) => {
      socket.removeListener('data', socketOnData);
      this.readyState = WebSocket.CLOSING;
      this._closeCode = err.statusCode;
      this.emit('error', err);
      socket.destroy();
    });

    socket.setTimeout(0);
    socket.setNoDelay();

    if (head.length > 0) {
      socket.unshift(head);
    }

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);

    this.readyState = WebSocket.OPEN;
  }

  public emitClose(): void {
    this.readyState = WebSocket.CLOSED;

    if (this._socket === void 0) {
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    this._receiver.removeAllListeners();
    this.emit('close', this._closeCode, this._closeMessage);
  }

  public close(
    code?: number,
    data?: string,
  ): void {
    switch (this.readyState) {
      case WebSocket.CLOSED:
        return;
      case WebSocket.CONNECTING:
        throw new Error('WebSocket was closed before the connection was established');
      case WebSocket.CLOSING:
        if (this._closeFrameSent && this._closeFrameReceived) {
          this._socket.end();
        }
        return;
    }

    this.readyState = WebSocket.CLOSING;
    this._sender.close(code, data, (err) => {
      if (err !== void 0) {
        return;
      }

      this._closeFrameSent = true;
      if (this._closeFrameReceived) {
        this._socket.end();
      }
    });

    this._closeTimer = setTimeout(
      this._socket.destroy.bind(this._socket),
      30000,
    );
  }

  public send(data: Buffer): void {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (this.readyState !== WebSocket.OPEN) {
      if (this._socket !== void 0) {
        this._sender._bufferedBytes += data.length;
      }
      return;
    }

    this._sender.send(data);
  }

  public terminate(): void {
    if (this.readyState === WebSocket.CLOSED) {
      return;
    }

    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket was closed before the connection was established');
    }

    if (this._socket !== void 0) {
      this.readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }

  public conclude(code: number, reason: string): void {
    this._socket.removeListener('data', socketOnData);
    this._socket.resume();

    this._closeFrameReceived = true;
    this._closeMessage = reason;
    this._closeCode = code;
  }
}

const wsLookup = new Map<Socket, WebSocket>();

function socketOnClose(
  this: Socket,
): void {
  const ws = wsLookup.get(this)!;

  this.removeListener('close', socketOnClose);
  this.removeListener('end', socketOnEnd);

  ws.readyState = WebSocket.CLOSING;

  ws._socket.read();
  ws._receiver.end();

  this.removeListener('data', socketOnData);

  wsLookup.delete(this);

  clearTimeout(ws._closeTimer!);

  if (
    Boolean((ws._receiver as any)._writableState.finished) ||
    Boolean((ws._receiver as any)._writableState.errorEmitted)
  ) {
    ws.emitClose();
  } else {
    ws._receiver.on('error', () => ws.emitClose());
    ws._receiver.on('finish', () => ws.emitClose());
  }
}

function socketOnData(
  this: Socket,
  chunk: Buffer,
): void {
  const ws = wsLookup.get(this)!;

  if (!ws._receiver.write(chunk)) {
    this.pause();
  }
}

function socketOnEnd(
  this: Socket,
): void {
  const ws = wsLookup.get(this)!;

  ws.readyState = WebSocket.CLOSING;
  ws._receiver.end();
  this.end();
}

function socketOnError(
  this: Socket,
): void {
  const ws = wsLookup.get(this);

  this.removeListener('error', socketOnError);
  this.on('error', PLATFORM.noop);

  if (ws !== void 0) {
    ws.readyState = WebSocket.CLOSING;
    this.destroy();
  }
}
