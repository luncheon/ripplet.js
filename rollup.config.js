export default {
  name: 'ripplet',
  input: './src/index.umd.ts',
  output: {
    file: './dist/index.js',
    format: 'umd',
  },
  plugins: [
    typescript(),
  ],
}

function typescript() {
  const ts = require('typescript')
  const tsconfig = require('./tsconfig.json')
  const compilerOptions = Object.assign({}, tsconfig && tsconfig.compilerOptions, { module: ts.ModuleKind.ES2015, noEmitHelpers: true, importHelpers: true })
  const compilerHost = ts.createCompilerHost(compilerOptions)
  const uglify = require('uglify-es')
  return {
    resolveId(importee, importer) {
      if (importer) {
        const resolved = ts.nodeModuleNameResolver(importee, importer.replace(/\\/g, '/'), compilerOptions, compilerHost)
        return resolved.resolvedModule.resolvedFileName.replace(/\/tslib\.d\.ts$/, '/tslib.es6.js')
      }
    },
    transform(code, id) {
      if (id.endsWith('.ts')) {
        const transformed = ts.transpileModule(code, { compilerOptions })
        return {
          code: transformed.outputText,
          map: transformed.sourceMapText && JSON.parse(transformed.sourceMapText),
        }
      }
      if (id.endsWith('/tslib.es6.js')) {
        return uglify.minify(code)
      }
    },
  }
}
