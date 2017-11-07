import _default, * as named from './ripplet-declarative'

export default Object.keys(named).reduce(
  (exporting: any, name: keyof typeof named) => (exporting[name] = named[name], exporting),
  _default as typeof _default & typeof named
)
