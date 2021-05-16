import ripplet from './ripplet'
export default ripplet
export * from './ripplet'

// Element.prototype.closest is not implemented in IE
// https://caniuse.com/#feat=element-closest
const findRippletTarget = (element: Element | null) => {
  while (element && !element.hasAttribute('data-ripplet')) {
    element = element.parentElement
  }
  return element
}

const parseOptions = (optionsString: string | null) => {
  const options: Record<string, string> = {}
  if (optionsString) {
    for (const s of optionsString.split(';')) {
      const index = s.indexOf(':')
      options[
        s
          .slice(0, index)
          .trim()
          .replace(/[a-zA-Z0-9_]-[a-z]/g, $0 => $0[0] + $0[2]!.toUpperCase())
      ] = s.slice(index + 1).trim()
    }
  }
  return options
}

addEventListener(
  'pointerdown',
  event => {
    if (event.button !== 0) {
      return
    }
    const currentTarget = findRippletTarget(event.target as Element)
    if (!currentTarget) {
      return
    }
    const options = parseOptions(currentTarget.getAttribute('data-ripplet'))
    if (options.clearing !== 'false') {
      options.clearing = 'false'
      const clear = () => {
        ripplet.clear(currentTarget, container)
        currentTarget.removeEventListener('pointerup', clear)
        currentTarget.removeEventListener('pointerleave', clear)
      }
      currentTarget.addEventListener('pointerup', clear)
      currentTarget.addEventListener('pointerleave', clear)
    }
    const container = ripplet({ currentTarget, clientX: event.clientX, clientY: event.clientY }, options)
  },
  true,
)
