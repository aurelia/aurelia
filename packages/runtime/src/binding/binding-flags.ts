export enum BindingFlags {
  none                = 0b0000000000000,
  mustEvaluate        = 0b0000000000001,
  batchChanges        = 0b0000000000010,
  isStarting          = 0b0000000000100,
  isStopping          = 0b0000000001000,
  isBinding           = 0b0000000010000,
  isUnbinding         = 0b0000000100000,
  isChange            = 0b0000001000000,
  sourceContext       = 0b0000010000000,
  targetContext       = 0b0000100000000,
  computedContext     = 0b0001000000000,
  checkedArrayContext = 0b0010000000000,
  checkedValueContext = 0b0100000000000,
  selectArrayContext  = 0b1000000000000,
  context             = 0b1111111000000
}
