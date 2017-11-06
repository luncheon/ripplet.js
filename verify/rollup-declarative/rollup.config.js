import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'verify-rollup-declarative.js',
  output: {
    format: 'umd',
    file: 'dist/index.js',
  },
  plugins: [
    resolve({
      module: true,
      browser: true,
    }),
  ]
}
