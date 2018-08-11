export enum BindingFlags {
  none             = 0b0000000,
  mustEvaluate     = 0b0000001,
  instanceMutation = 0b0000010,
  itemsMutation    = 0b0000100,
  batchChanges     = 0b0001000,
  sourceContext    = 0b0010000,
  targetContext    = 0b0100000,
  computedContext  = 0b1000000,
  context          = 0b1110000
}
