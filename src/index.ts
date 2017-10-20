export type TimingFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'step-start' | 'step-end' | string | null

export interface RippletOptions {
  className:                string | null
  color:                    string | null
  opacity:                  string | number | null
  spreadingDuration:        string | null
  spreadingDelay:           string | null
  spreadingTimingFunction:  TimingFunction
  clearingDuration:         string | null
  clearingDelay:            string | null
  clearingTimingFunction:   TimingFunction
}

export const defaultOptions: RippletOptions = {
  className:                'ripplet',
  color:                    'rgba(0, 0, 0, .1)',
  opacity:                  1,
  spreadingDuration:        '.4s',
  spreadingDelay:           '0s',
  spreadingTimingFunction:  'ease-out',
  clearingDuration:         '1s',
  clearingDelay:            '0s',
  clearingTimingFunction:   'ease-in-out',
}

export default function ripplet(targetSuchAsMouseEvent: { currentTarget: HTMLElement, clientX: number, clientY: number }, options?: Readonly<Partial<RippletOptions>>) {
  return generateRipplet(targetSuchAsMouseEvent, options ? { ...defaultOptions, ...options, color: options.hasOwnProperty('color') ? options.color! : defaultOptions.color } : defaultOptions)
}

function generateRipplet({ currentTarget: target, clientX, clientY }: { currentTarget: HTMLElement, clientX: number, clientY: number }, options: Readonly<RippletOptions>) {
  const targetRect = target.getBoundingClientRect()
  const containerElement = document.body.appendChild(document.createElement('div'))
  {
    const targetStyle             = window.getComputedStyle(target)
    const containerStyle          = containerElement.style
    containerStyle.position       = 'absolute'
    containerStyle.overflow       = 'hidden'
    containerStyle.pointerEvents  = 'none'
    containerStyle.left           = `${targetRect.left + document.documentElement.scrollLeft + document.body.scrollLeft}px`
    containerStyle.top            = `${targetRect.top  + document.documentElement.scrollTop  + document.body.scrollTop}px`
    containerStyle.width          = `${targetRect.width}px`
    containerStyle.height         = `${targetRect.height}px`
    containerStyle.zIndex         = String((targetStyle.zIndex && parseInt(targetStyle.zIndex, 10) || 0) + 1)
    containerStyle.borderTopLeftRadius      = targetStyle.borderTopLeftRadius
    containerStyle.borderTopRightRadius     = targetStyle.borderTopRightRadius
    containerStyle.borderBottomLeftRadius   = targetStyle.borderBottomLeftRadius
    containerStyle.borderBottomRightRadius  = targetStyle.borderBottomRightRadius
    containerStyle.transition     = `opacity ${options.clearingDuration} ${options.clearingTimingFunction} ${options.clearingDelay}`
    containerStyle.opacity        = '1'
    setTimeout(() => containerStyle.opacity = '0')
  }

  const rippletElement = containerElement.appendChild(document.createElement('div'))
  options.className && (rippletElement.className = options.className)
  {
    const distanceX = Math.max(clientX - targetRect.left, targetRect.right - clientX)
    const distanceY = Math.max(clientY - targetRect.top, targetRect.bottom - clientY)
    const radius    = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    const rippletStyle = rippletElement.style
    options.color   && (rippletStyle.backgroundColor = options.color)
    options.opacity && (rippletStyle.opacity = String(options.opacity))
    rippletStyle.width         = `${radius * 2}px`
    rippletStyle.height        = `${radius * 2}px`
    rippletStyle.marginLeft    = `${clientX - targetRect.left - radius}px`
    rippletStyle.marginTop     = `${clientY - targetRect.top  - radius}px`
    rippletStyle.borderRadius  = '50%'
    rippletStyle.transition    = `transform ${options.spreadingDuration} ${options.spreadingTimingFunction} ${options.spreadingDelay}`
    rippletStyle.transform     = 'scale(0)'
    setTimeout(() => rippletStyle.transform = 'scale(1)')
  }

  containerElement.addEventListener('transitionend', function (this: typeof containerElement, event: TransitionEvent) {
    if (event.propertyName === 'opacity') {
      this.parentNode!.removeChild(this)
    }
  })

  return containerElement
}
