// import { ILogger, resolve } from '@aurelia/kernel';
// import { IDevTools, IDevToolsExtension, IDevToolsOptions } from './interfaces-devtools';
// import { IStore } from './interfaces';

// export class DevToolsConnector<T extends object> {
//   private readonly logger!: ILogger;

//   private readonly _extension = resolve(IDevToolsExtension);
//   private readonly _hasDevTools = this._extension !== null;
//   private devTools?: IDevTools<T>;

//   public connect(store: IStore<T>, options: IDevToolsOptions) {
//     if (!this._hasDevTools) return;
//     // TODO: needs a better solution for global override
//     this.devTools = this._extension.connect(options);
//     this.devTools.init(store.getInitialState());

//     this.devTools.subscribe((message) => {
//       // this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)](`DevTools sent change ${message.type}`);

//       if (message.type === "ACTION" && message.payload !== undefined) {
//         const byName = Array.from(this.actions).find(function ([reducer]) {
//           return reducer.name === message.payload?.name;
//         });
//         const action = this.lookupAction(message.payload?.name) ?? byName?.[0];

//         if (!action) {
//           throw new DevToolsRemoteDispatchError("Tried to remotely dispatch an unregistered action");
//         }

//         if (!message.payload.args || message.payload.args.length < 1) {
//           throw new DevToolsRemoteDispatchError("No action arguments provided");
//         }

//         this.dispatch(action, ...message.payload.args.slice(1).map((arg: string) => JSON.parse(arg) as T)).catch(() => {
//           throw new DevToolsRemoteDispatchError("Issue when trying to dispatch an action through devtools");
//         });
//         return;
//       }

//       if (message.type === "DISPATCH" && message.payload) {
//         switch (message.payload.type) {
//           case "JUMP_TO_STATE":
//           case "JUMP_TO_ACTION":
//             this._state.next(JSON.parse(message.state));
//             return;
//           case "COMMIT":
//             this.devTools!.init(this._state.getValue());
//             return;
//           case "RESET":
//             this.devTools!.init(this.initialState);
//             this.resetToState(this.initialState);
//             return;
//           case "ROLLBACK": {
//             const parsedState = JSON.parse(message.state) as T;

//             this.resetToState(parsedState);
//             this.devTools!.init(parsedState);
//             return;
//           }
//         }
//       }
//     });
//   }
// }
