#!/usr/bin/env node

try {
  require('../dist/umd/index.js');
} catch {
  require('../dist/esnext/index.js');
}
