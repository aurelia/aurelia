export enum BindingFlags {
  none                = 0b000000000,
  mustEvaluate        = 0b000000001,
  instanceMutation    = 0b000000010,
  itemsMutation       = 0b000000100,
  batchChanges        = 0b000001000,
  sourceContext       = 0b000010000,
  targetContext       = 0b000100000,
  computedContext     = 0b001000000,
  checkedArrayContext = 0b010000000,
  checkedValueContext = 0b100000000,
  context             = 0b111110000
}
