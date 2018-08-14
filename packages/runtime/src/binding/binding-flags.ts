export enum BindingFlags {
  none                = 0b0000000000,
  mustEvaluate        = 0b0000000001,
  instanceMutation    = 0b0000000010,
  itemsMutation       = 0b0000000100,
  batchChanges        = 0b0000001000,
  sourceContext       = 0b0000010000,
  targetContext       = 0b0000100000,
  computedContext     = 0b0001000000,
  checkedArrayContext = 0b0010000000,
  checkedValueContext = 0b0100000000,
  selectArrayContext  = 0b1000000000,
  context             = 0b1111110000
}
