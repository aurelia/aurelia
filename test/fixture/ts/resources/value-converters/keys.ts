export class KeysValueConverter {
  public toView(value: Object): PropertyKey[] {
    if (value) {
      return Reflect.ownKeys(value);
    }

    return [];
  }
}
