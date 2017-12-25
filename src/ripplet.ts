export type RippletOptions = Readonly<typeof defaultOptions>

export const defaultOptions = {
  className:                '',
  color:                    'rgba(0, 0, 0, .1)' as string | null,
  opacity:                  null                as string | null,
  spreadingDuration:        '.4s'               as string | null,
  spreadingDelay:           '0s'                as string | null,
  spreadingTimingFunction:  'linear'            as string | null,
  clearingDuration:         '1s'                as string | null,
  clearingDelay:            '0s'                as string | null,
  clearingTimingFunction:   'ease-in-out'       as string | null,
  centered:                 false               as boolean | 'true' | 'false' | null,
  appendTo:                 'body'              as 'body' | 'parent' | null,
}

export default function ripplet(
  targetSuchAsMouseEvent: MouseEvent | Readonly<{ currentTarget: Element, clientX: number, clientY: number }>,
  options?:               Partial<RippletOptions>,
): HTMLElement

export default function ripplet(
  targetSuchAsMouseEvent: Event | Readonly<{ currentTarget: Element }>,
  options?:               Partial<RippletOptions>,
): HTMLElement | undefined

export default function ripplet(
  { currentTarget, clientX, clientY }:  Readonly<{ currentTarget: Element | EventTarget, clientX?: number, clientY?: number }>,
  options?:                             Partial<RippletOptions>,
): HTMLElement | undefined {
  if (!(currentTarget instanceof Element)) {
    return
  }
  const mergedOptions = mergeDefaultOptions(options)
  const targetRect = currentTarget.getBoundingClientRect()
  if (mergedOptions.centered && mergedOptions.centered !== 'false') {
    clientX = targetRect.left + targetRect.width  * .5
    clientY = targetRect.top  + targetRect.height * .5
  } else if (typeof clientX !== 'number' || typeof clientY !== 'number') {
    return
  }
  return generateRipplet(currentTarget, clientX, clientY, targetRect, mergedOptions)
}

function generateRipplet(
  targetElement:  Element,
  originX:        number,
  originY:        number,
  targetRect:     Readonly<ClientRect>,
  options:        RippletOptions,
) {
  const doc = document  // for minification efficiency
  const targetStyle = getComputedStyle(targetElement)
  let removingElement: Element
  let containerElement: HTMLElement
  let containerStyle: CSSStyleDeclaration
  if (targetStyle.position === 'fixed' || (targetStyle.position === 'absolute' && options.appendTo === 'parent')) {
    containerElement = removingElement = doc.createElement('div')
    if (options.appendTo === 'parent') {
      targetElement.parentElement!.insertBefore(containerElement, targetElement)
    } else {
      doc.body.appendChild(containerElement)
    }
    containerStyle = containerElement.style
    copyStyles(
      containerStyle,
      targetStyle,
      ['position', 'left', 'top', 'right', 'bottom', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom']
    )
  } else if (options.appendTo === 'parent') {
    const containerContainer                = removingElement
                                            = targetElement.parentElement!.insertBefore(doc.createElement('div'), targetElement)
    const containerContainerStyle           = containerContainer.style
    containerContainerStyle.display         = 'inline-block'
    containerContainerStyle.position        = 'relative'
    containerContainerStyle.width           = '0'
    containerContainerStyle.height          = '0'
    containerContainerStyle.cssFloat        = targetStyle.cssFloat

    const containerContainerRect            = containerContainer.getBoundingClientRect()  // this may be a slow operation...
    containerElement                        = containerContainer.appendChild(doc.createElement('div'))
    containerStyle                          = containerElement.style
    containerStyle.position                 = 'absolute'
    containerStyle.top                      = `${targetRect.top  - containerContainerRect.top}px`
    containerStyle.left                     = `${targetRect.left - containerContainerRect.left}px`
  } else {
    containerElement                        = removingElement
                                            = doc.body.appendChild(doc.createElement('div'))
    containerStyle                          = containerElement.style
    containerStyle.position                 = 'absolute'
    containerStyle.left                     = `${targetRect.left + doc.documentElement.scrollLeft + doc.body.scrollLeft}px`
    containerStyle.top                      = `${targetRect.top  + doc.documentElement.scrollTop  + doc.body.scrollTop}px`
  }
  containerStyle.overflow                 = 'hidden'
  containerStyle.pointerEvents            = 'none'
  containerStyle.width                    = `${targetRect.width}px`
  containerStyle.height                   = `${targetRect.height}px`
  containerStyle.zIndex                   = `${(parseInt(targetStyle.zIndex as any, 10) || 0) + 1}`
  containerStyle.opacity                  = options.opacity
  copyStyles(
    containerStyle,
    targetStyle,
    ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']
  )

  const rippletElement                    = containerElement.appendChild(doc.createElement('div'))
  rippletElement.className                = options.className
  {
    const distanceX                         = Math.max(originX - targetRect.left, targetRect.right - originX)
    const distanceY                         = Math.max(originY - targetRect.top, targetRect.bottom - originY)
    const radius                            = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const rippletStyle                      = rippletElement.style
    rippletStyle.backgroundColor            = options.color
    rippletStyle.width                      = `${radius * 2}px`
    rippletStyle.height                     = `${radius * 2}px`
    rippletStyle.marginLeft                 = `${originX - targetRect.left - radius}px`
    rippletStyle.marginTop                  = `${originY - targetRect.top  - radius}px`
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
  rippletElement.addEventListener('transitionend', event => {
    if ((event as TransitionEvent).propertyName === 'opacity' && removingElement.parentElement) {
      removingElement.parentElement.removeChild(removingElement)
    }
  })

  return containerElement
}

function copyStyles<T>(destination: T, source: Readonly<T>, properties: (keyof T)[]) {
  for (const property of properties) {
    destination[property] = source[property]
  }
}

function mergeDefaultOptions(options?: Partial<RippletOptions>): RippletOptions {
  if (!options) {
    return defaultOptions
  }
  const mergedOptions = {} as typeof defaultOptions
  (Object.keys(defaultOptions) as (keyof RippletOptions)[]).forEach(field => {
    mergedOptions[field] = options.hasOwnProperty(field) ? options[field]! : defaultOptions[field]
  })
  return mergedOptions
}
