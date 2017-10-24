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

export default function ripplet(targetSuchAsMouseEvent: MouseEvent | Readonly<{ currentTarget: Element, clientX: number, clientY: number }>,                 options?: Readonly<Partial<RippletOptions>>): HTMLElement
export default function ripplet(targetSuchAsMouseEvent: Event,                                                                                               options?: Readonly<Partial<RippletOptions>>): HTMLElement | undefined
export default function ripplet({ currentTarget, clientX, clientY }: Readonly<{ currentTarget: Element | EventTarget, clientX?: number, clientY?: number }>, options?: Readonly<Partial<RippletOptions>>): HTMLElement | undefined {
  if (currentTarget instanceof Element && typeof clientX === 'number' && typeof clientY === 'number') {
    return generateRipplet({ clientX, clientY }, currentTarget.getBoundingClientRect(), window.getComputedStyle(currentTarget), options ? { ...defaultOptions, ...options } : defaultOptions)
  } else {
    return
  }
}

function generateRipplet(origin: { clientX: number, clientY: number }, targetRect: ClientRect, targetStyle: Readonly<CSSStyleDeclaration>, options: Readonly<RippletOptions>) {
  const doc = document
  const containerElement = doc.body.appendChild(doc.createElement('div'))
  {
    const containerStyle                    = containerElement.style
    containerStyle.position                 = 'absolute'
    containerStyle.overflow                 = 'hidden'
    containerStyle.pointerEvents            = 'none'
    containerStyle.left                     = `${targetRect.left + doc.documentElement.scrollLeft + doc.body.scrollLeft}px`
    containerStyle.top                      = `${targetRect.top  + doc.documentElement.scrollTop  + doc.body.scrollTop}px`
    containerStyle.width                    = `${targetRect.width}px`
    containerStyle.height                   = `${targetRect.height}px`
    containerStyle.zIndex                   = `${(targetStyle.zIndex && parseInt(targetStyle.zIndex, 10) || 0) + 1}`
    containerStyle.borderTopLeftRadius      = targetStyle.borderTopLeftRadius
    containerStyle.borderTopRightRadius     = targetStyle.borderTopRightRadius
    containerStyle.borderBottomLeftRadius   = targetStyle.borderBottomLeftRadius
    containerStyle.borderBottomRightRadius  = targetStyle.borderBottomRightRadius
    containerStyle.opacity                  = options.opacity
  }

  const rippletElement = containerElement.appendChild(doc.createElement('div'))
  rippletElement.className = options.className
  {
    const distanceX     = Math.max(origin.clientX - targetRect.left, targetRect.right - origin.clientX)
    const distanceY     = Math.max(origin.clientY - targetRect.top, targetRect.bottom - origin.clientY)
    const radius        = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const rippletStyle  = rippletElement.style
    rippletStyle.backgroundColor            = options.color
    rippletStyle.width                      = `${radius * 2}px`
    rippletStyle.height                     = `${radius * 2}px`
    rippletStyle.marginLeft                 = `${origin.clientX - targetRect.left - radius}px`
    rippletStyle.marginTop                  = `${origin.clientY - targetRect.top  - radius}px`
    rippletStyle.borderRadius               = '50%'
    rippletStyle.transitionProperty         = 'transform,opacity'
    rippletStyle.transitionDuration         = `${options.spreadingDuration      },${options.clearingDuration      }`
    rippletStyle.transitionTimingFunction   = `${options.spreadingTimingFunction},${options.clearingTimingFunction}`
    rippletStyle.transitionDelay            = `${options.spreadingDelay         },${options.clearingDelay         }`
    rippletStyle.transform                  = 'scale(0)'
    rippletStyle.opacity                    = '1'
    setTimeout(() => {
      rippletStyle.transform                  = 'scale(1)'
      rippletStyle.opacity                    = '0'
    })
  }

  rippletElement.addEventListener('transitionend', (event: TransitionEvent) => {
    if (event.propertyName === 'opacity' && containerElement.parentNode) {
      containerElement.parentNode.removeChild(containerElement)
    }
  })

  return containerElement
}
