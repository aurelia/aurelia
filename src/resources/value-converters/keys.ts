export class KeysValueConverter {
  
  toView(value) {
    if (value)
      return Reflect.ownKeys(value);
  }
  
}
