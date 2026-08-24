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

export function assertRealisticRows(host, items, CustomElement) {
  const hosts = [...host.children];
  const viewModels = captureRealisticViewModels(host, items, CustomElement);

  for (let index = 0; index < items.length; index++) {
    const rowHost = hosts[index];
    const item = items[index];
    const article = rowHost?.firstElementChild;
    if (rowHost?.localName !== 'benchmark-task-row' || article?.localName !== 'article') {
      throw new Error(`Realistic benchmark row ${index} has an unexpected element structure.`);
    }
    const viewModel = viewModels[item.id];
    const expectedClass = item.selected
      ? `task-row is-selected ${item.status}`
      : `task-row ${item.status}`;
    if (
      viewModel.itemId !== item.id
      || viewModel.label !== item.label
      || viewModel.owner !== item.owner
      || viewModel.progress !== item.progress
      || viewModel.status !== item.status
      || viewModel.selected !== item.selected
      || viewModel.detail !== item.detail
      || article.className !== expectedClass
      || article.title !== `${item.label} assigned to ${item.owner}`
      || article.querySelector('h3')?.textContent !== item.label
      || article.querySelector('.owner')?.textContent !== item.owner
      || article.querySelector('.status')?.textContent !== item.status
      || article.querySelector('progress')?.value !== item.progress
      || article.querySelector('.progress')?.textContent !== `${item.progress}%`
      || (article.querySelector('.detail') !== null) !== (item.status === 'blocked')
      || article.querySelector('button') === null
    ) {
      throw new Error(`Realistic benchmark row ${index} does not match item ${item.id}.`);
    }
  }
  return { hosts, viewModels };
}

export function captureRealisticViewModels(host, items, CustomElement) {
  const rows = host.children;
  if (rows.length !== items.length) {
    throw new Error(`Expected ${items.length} realistic rows, rendered ${rows.length}.`);
  }
  const viewModels = [];
  for (let index = 0; index < items.length; index++) {
    const viewModel = CustomElement.for(rows[index]).viewModel;
    if (viewModel.itemId !== items[index].id || viewModels[viewModel.itemId] !== undefined) {
      throw new Error(`Realistic benchmark row ${index} has an invalid item identity.`);
    }
    viewModels[viewModel.itemId] = viewModel;
  }
  return viewModels;
}

export function assertRealisticOpenEvent(rowHost, viewModel) {
  const previousCount = viewModel.openCount;
  rowHost.querySelector('button').click();
  if (viewModel.openCount !== previousCount + 1) {
    throw new Error(`Realistic benchmark row ${viewModel.itemId} did not handle its click binding.`);
  }
}
