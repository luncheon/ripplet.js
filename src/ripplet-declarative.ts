import ripplet from './ripplet'
export default ripplet
export * from './ripplet'

window.addEventListener('mousedown', event => {
  if (event.button !== 0) {
    return
  }
  const currentTarget = (event.target as Element).closest('[data-ripplet]')
  if (currentTarget) {
    ripplet({ currentTarget, clientX: event.clientX, clientY: event.clientY }, parseOptions(currentTarget.getAttribute('data-ripplet')))
  }
}, true)

function parseOptions(optionsString: string | null) {
  if (!optionsString) {
    return
  }
  const split = optionsString
    .replace(/\s*/g, '')
    .replace(/[a-zA-Z0-9_]-[a-z]/g, $0 => $0[0] + $0[2].toUpperCase())
    .split(';')
  if (split.length === 0) {
    return
  }
  const options: Record<string, string> = {}
  for (const s of split) {
    const [key, value] = s.split(':', 2)
    options[key] = value
  }
  return options
}
