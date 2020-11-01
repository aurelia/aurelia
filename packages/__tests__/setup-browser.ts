import { BrowserPlatform } from '@aurelia/platform-browser';
import { $setup } from './setup-shared';

const platform = new BrowserPlatform(window);
$setup(platform);

console.log(`Browser test context initialized`);

function importAll(r) {
  r.keys().forEach(r);
}

// Explicitly add to browser test
// importAll(require.context('./1-kernel/', true, /\.spec\.js$/));
// importAll(require.context('./2-runtime/', true, /\.spec\.js$/));
// importAll(require.context('./3-runtime-html/', true, /\.spec\.js$/));

// importAll(require.context('./fetch-client/', true, /\.spec\.js$/));
// importAll(require.context('./i18n/t/', true, /\.spec\.js$/));
// importAll(require.context('./integration/', true, /\.spec\.js$/));
// importAll(require.context('./router/', true, /\.spec\.js$/));
// importAll(require.context('./validation/', true, /\.spec\.js$/));
// importAll(require.context('./validation-html/', true, /\.spec\.js$/));
// importAll(require.context('./validation-i18n/', true, /\.spec\.js$/));
importAll(require.context('./3-runtime-html/', false, /styles\.spec\.js$/));
