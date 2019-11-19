// Builtin function

// export class $NAME extends $BuiltinFunction<'%NAME%'> {
//   public constructor(
//     realm: Realm,
//   ) {
//     const intrinsics = realm['[[Intrinsics]]'];
//     super(realm, '%NAME%', intrinsics['%FunctionPrototype%']);
//   }

//   public performSteps(
//     ctx: ExecutionContext,
//     thisArgument: $AnyNonEmpty,
//     argumentsList: readonly $AnyNonEmpty[],
//     NewTarget: $AnyNonEmpty,
//   ): $AnyNonEmpty {
//     throw new Error('Method not implemented.');
//   }
// }
