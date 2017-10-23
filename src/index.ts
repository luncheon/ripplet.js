export type TimingFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'step-start' | 'step-end' | string | null

export interface RippletOptions {
  className:                string
  color:                    string | null
  opacity:                  string | null
  spreadingDuration:        string | null
  spreadingDelay:           string | null
  spreadingTimingFunction:  TimingFunction
  clearingDuration:         string | null
  clearingDelay:            string | null
  clearingTimingFunction:   TimingFunction
}

export const defaultOptions: RippletOptions = {
  className:                '',
  color:                    'rgba(0, 0, 0, .1)',
  opacity:                  null,
  spreadingDuration:        '.4s',
  spreadingDelay:           '0s',
  spreadingTimingFunction:  'linear',
  clearingDuration:         '1s',
  clearingDelay:            '0s',
  clearingTimingFunction:   'ease-in-out',
}

export default function ripplet(targetSuchAsMouseEvent: { currentTarget: Element | EventTarget, clientX: number, clientY: number }, options?: Readonly<Partial<RippletOptions>>): HTMLElement {
  return generateRipplet(targetSuchAsMouseEvent as any, options ? { ...defaultOptions, ...options } : defaultOptions)
}

function generateRipplet({ currentTarget: target, clientX, clientY }: { currentTarget: Element, clientX: number, clientY: number }, options: Readonly<RippletOptions>) {
  const doc = document
  const targetRect = target.getBoundingClientRect()
  const containerElement = doc.body.appendChild(doc.createElement('div'))
  {
    const targetStyle             = window.getComputedStyle(target)
    const containerStyle          = containerElement.style
    containerStyle.position       = 'absolute'
    containerStyle.overflow       = 'hidden'
    containerStyle.pointerEvents  = 'none'
    containerStyle.left           = `${targetRect.left + doc.documentElement.scrollLeft + doc.body.scrollLeft}px`
    containerStyle.top            = `${targetRect.top  + doc.documentElement.scrollTop  + doc.body.scrollTop}px`
    containerStyle.width          = `${targetRect.width}px`
    containerStyle.height         = `${targetRect.height}px`
    containerStyle.zIndex         = `${(targetStyle.zIndex && parseInt(targetStyle.zIndex, 10) || 0) + 1}`
    containerStyle.borderTopLeftRadius      = targetStyle.borderTopLeftRadius
    containerStyle.borderTopRightRadius     = targetStyle.borderTopRightRadius
    containerStyle.borderBottomLeftRadius   = targetStyle.borderBottomLeftRadius
    containerStyle.borderBottomRightRadius  = targetStyle.borderBottomRightRadius
    containerStyle.transitionProperty       = 'opacity'
    containerStyle.transitionDuration       = options.clearingDuration
    containerStyle.transitionTimingFunction = options.clearingTimingFunction
    containerStyle.transitionDelay          = options.clearingDelay
    containerStyle.opacity                  = '1'
    setTimeout(() => containerStyle.opacity = '0')
  }

  const rippletElement = containerElement.appendChild(doc.createElement('div'))
  rippletElement.className = options.className
  {
    const distanceX = Math.max(clientX - targetRect.left, targetRect.right - clientX)
    const distanceY = Math.max(clientY - targetRect.top, targetRect.bottom - clientY)
    const radius    = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const rippletStyle = rippletElement.style
    rippletStyle.backgroundColor            = options.color
    rippletStyle.opacity                    = options.opacity
    rippletStyle.width                      = `${radius * 2}px`
    rippletStyle.height                     = `${radius * 2}px`
    rippletStyle.marginLeft                 = `${clientX - targetRect.left - radius}px`
    rippletStyle.marginTop                  = `${clientY - targetRect.top  - radius}px`
    rippletStyle.borderRadius               = '50%'
    rippletStyle.transitionProperty         = 'transform'
    rippletStyle.transitionDuration         = options.spreadingDuration
    rippletStyle.transitionTimingFunction   = options.spreadingTimingFunction
    rippletStyle.transitionDelay            = options.spreadingDelay
    rippletStyle.transform                  = 'scale(0)'
    setTimeout(() => rippletStyle.transform = 'scale(1)')
  }

  containerElement.addEventListener('transitionend', function (this: typeof containerElement, event: TransitionEvent) {
    event.propertyName === 'opacity' && this.parentNode!.removeChild(this)
  })

  return containerElement
}
