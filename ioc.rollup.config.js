import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'ioc/index.ts',
  indent: false,
  output: {
    file: 'ioc/dist/aurelia-ioc.js',
    format: 'cjs'
  },
  name: 'core',
  plugins: [
    typescript({
      tsconfig: 'ioc/tsconfig.json',
      cacheRoot: '.rollupcache'
    })
  ]
};
