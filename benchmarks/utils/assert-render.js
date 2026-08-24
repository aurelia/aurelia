export function assertDirectRows(host, expectedCount, expectedTag, expectedText) {
  const rows = host.children;
  if (rows.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} benchmark rows, rendered ${rows.length}.`);
  }

  for (const [index, text] of Object.entries(expectedText)) {
    const row = rows[Number(index)];
    if (row?.localName !== expectedTag) {
      throw new Error(`Expected benchmark row ${index} to be <${expectedTag}>.`);
    }
    if (row.textContent !== text) {
      throw new Error(`Benchmark row ${index} rendered "${row.textContent}", expected "${text}".`);
    }
  }
}

export function assertSelectorCount(host, selector, expectedCount) {
  const actualCount = host.querySelectorAll(selector).length;
  if (actualCount !== expectedCount) {
    throw new Error(`Expected ${expectedCount} matches for "${selector}", rendered ${actualCount}.`);
  }
}
