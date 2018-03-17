function newRecord(type: string, object: any, key: any, oldValue?: any) {
  return {
    type: type,
    object: object,
    key: key,
    oldValue: oldValue
  };
}

export function getChangeRecords(map: Set<any> | Map<any, any>) {
  let entries = new Array(map.size);
  let keys = map.keys();
  let i = 0;
  let item;

  while (item = keys.next()) { // eslint-disable-line no-cond-assign
    if (item.done) {
      break;
    }

    entries[i] = newRecord('added', map, item.value);
    i++;
  }

  return entries;
}
