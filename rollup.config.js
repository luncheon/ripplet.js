import summary from 'rollup-plugin-summary'

export default {
  output: {
    format: 'umd',
  },
  plugins: [
    umdEntry(),
    typescript(),
    summary(),
  ],
}

const path = require('path')

const umdEntryTemplate = entry =>
`import _default, * as named from './${path.parse(entry).name}'
Object.keys(named).forEach(function (name) { _default[name] = named[name] })
export default _default
`

function umdEntry() {
  return {
    resolveId(importee, importer) {
      if (!importer) {
        return path.resolve(__dirname, importee + '?')
      }
    },
    load(id) {
      if (id.endsWith('?')) {
        return umdEntryTemplate(id.slice(0, -1))
      }
    },
  }
}

function typescript() {
  const ts = require('typescript')
  const tsconfig = require('./tsconfig.json')
  const compilerOptions = Object.assign({}, tsconfig && tsconfig.compilerOptions, { module: ts.ModuleKind.ES2015, noEmitHelpers: true, importHelpers: true })
  const compilerHost = ts.createCompilerHost(compilerOptions)
  const { minify } = require('terser')
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
        return minify(code)
      }
    },
  }
}
