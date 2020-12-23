import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle/index.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json'
    })
  ]
}
