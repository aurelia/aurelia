export enum BindingFlags {
  none             = 0b00000,
  mustEvaluate     = 0b00001,
  instanceMutation = 0b00010,
  itemsMutation    = 0b00100,
  connectImmediate = 0b01000,
  createObjects    = 0b10000
}
