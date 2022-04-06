import { Transformer } from '@parcel/plugin';
import SourceMap from '@parcel/source-map';
import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
// eslint-disable-next-line import/no-nodejs-modules
import { relative, extname } from 'path';

export default new Transformer({
  async loadConfig({config}) {
    try {
      const conf = await config.getConfig([], {packageKey: 'aurelia'});
      return conf ? conf.contents : {};
    } catch (e) {
      return {};
    }
  },
  async transform({asset, config, options}) {
    // parcel conventions puts app's index.html inside src/ folder.
    if (asset.filePath.endsWith('src/index.html')) return [asset];

    const auOptions = preprocessOptions(config as IOptionalPreprocessOptions);
    // after html template is compiled to js, parcel will apply full js transformers chain,
    // we need to skip them here, then parcel will apply the rest standard js chain.
    if (asset.type === 'js' && auOptions.templateExtensions.includes(extname(asset.filePath))) {
      return [asset];
    }

    const source = await asset.getCode();
    const result = preprocess(
      {
        path: relative(options.projectRoot, asset.filePath.slice()),
        contents: source
      },
      auOptions
    );

    if (!result) {
      return [asset];
    }

    asset.setCode(result.code);
    const map = new SourceMap();
    map.addVLQMap(result.map);
    asset.setMap(map);

    if (auOptions.templateExtensions.includes(`.${asset.type}`)) {
      asset.type = 'js';
    }

    // Return the asset
    return [asset];
  }
});
