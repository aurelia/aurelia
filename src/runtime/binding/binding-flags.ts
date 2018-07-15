export enum BindingFlags {
  none             = 0b0000,
  mustEvaluate     = 0b0001,
  instanceMutation = 0b0010,
  itemsMutation    = 0b0100,
  connectImmediate = 0b1000
}
