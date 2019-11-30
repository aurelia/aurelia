export class $ValueRecord<T> {
  public '[[Value]]': T;

  public constructor(
    value: T,
  ) {
    this['[[Value]]'] = value;
  }
}
