import ripplet from './ripplet'
export default ripplet
export * from './ripplet'

// use passive event listener if possible
let eventListenerOptions: boolean | AddEventListenerOptions = true
{
  const testOptions: AddEventListenerOptions = {
    get passive() {
      eventListenerOptions = { passive: true, capture: true }
      return true
    },
  }
  const noop = () => {}
  addEventListener('test', noop, testOptions)
  removeEventListener('test', noop, testOptions)
}

addEventListener('mousedown', event => {
  if (event.button !== 0) {
    return
  }
  const currentTarget = findRippletTarget(event.target as Element)
  if (currentTarget) {
    ripplet({ currentTarget, clientX: event.clientX, clientY: event.clientY }, parseOptions(currentTarget.getAttribute('data-ripplet')))
  }
}, eventListenerOptions)

function parseOptions(optionsString: string | null) {
  if (!optionsString) {
    return
  }
  const options: Record<string, string> = {}
  for (const s of optionsString.split(';')) {
    const index = s.indexOf(':')
    options[s.slice(0, index).trim().replace(/[a-zA-Z0-9_]-[a-z]/g, $0 => $0[0] + $0[2].toUpperCase())] = s.slice(index + 1).trim()
  }
  return options
}

// Element.prototype.closest is not implemented in IE
// https://caniuse.com/#feat=element-closest
function findRippletTarget(element: Element | null) {
  while (element && !element.hasAttribute('data-ripplet')) {
    element = element.parentElement
  }
  return element
}
