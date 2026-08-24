const statuses = ['active', 'blocked', 'pending'];

export function createRealisticRecords(count, revision = 0, firstId = 0) {
  if (!Number.isSafeInteger(count) || count < 0) throw new Error(`Invalid realistic record count ${count}.`);
  return Array.from({ length: count }, (_, index) => createRecord(firstId + index, revision));
}

export function createRefreshedRealisticRecords(records) {
  return records.map(record => createRecord(record.id, record.revision + 1));
}

export function createMixedRealisticRecords(records) {
  if (records.length === 0 || records.length % 10 !== 0) {
    throw new Error(`Mixed realistic record count must be a positive multiple of 10, received ${records.length}.`);
  }
  const result = [];
  for (let offset = 0; offset < records.length; offset += 10) {
    const block = records.slice(offset, offset + 10);
    for (let index = 0; index < 10; index++) {
      if (block[index].id !== offset + index) {
        throw new Error(`Mixed realistic records are not in their initial order at index ${offset + index}.`);
      }
    }

    // Each ten-row block removes offset+0, updates offset+2, keeps offset+3 through offset+9
    // ordered, moves offset+1 behind them, and inserts one new id. This keeps moves deterministic.
    result.push(createRecord(block[2].id, block[2].revision + 1));
    result.push(...block.slice(3), block[1]);
    result.push(createRecord(records.length + offset / 10, 1));
  }
  return result;
}

function createRecord(id, revision) {
  const status = statuses[(id + revision) % statuses.length];
  const progress = (id * 17 + revision * 23) % 101;
  return {
    id,
    revision,
    label: `Task ${id} r${revision}`,
    owner: `Team ${(id + revision) % 8}`,
    progress,
    status,
    selected: (id + revision) % 7 === 0,
    detail: `Task ${id} is ${status} at revision ${revision}`,
  };
}
