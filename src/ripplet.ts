export type RippletOptions = Readonly<typeof defaultOptions>

export const defaultOptions = {
  className:                '',
  color:                    'rgba(0,0,0,.1)'  as string | null,
  opacity:                  null              as string | null,
  spreadingDuration:        '.4s'             as string | null,
  spreadingDelay:           '0s'              as string | null,
  spreadingTimingFunction:  'linear'          as string | null,
  clearingDuration:         '1s'              as string | null,
  clearingDelay:            '0s'              as string | null,
  clearingTimingFunction:   'ease-in-out'     as string | null,
  centered:                 false             as boolean | 'true' | 'false' | null,
  appendTo:                 'body'            as 'body' | 'parent' | null,
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
  const doc                             = document  // for minification efficiency
  const { documentElement, body }       = doc
  const createDiv: () => HTMLDivElement = doc.createElement.bind(doc, 'div')
  const containerElement                = createDiv()
  let removingElement                   = containerElement
  {
    const appendToParent                = options.appendTo === 'parent'
    const targetStyle                   = getComputedStyle(targetElement)
    const containerStyle                = containerElement.style
    if (targetStyle.position === 'fixed' || (targetStyle.position === 'absolute' && appendToParent)) {
      if (appendToParent) {
        targetElement.parentElement!.insertBefore(containerElement, targetElement)
      } else {
        body.appendChild(containerElement)
      }
      copyStyles(
        containerStyle,
        targetStyle,
        ['position', 'left', 'top', 'right', 'bottom', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom']
      )
    } else if (appendToParent) {
      const containerContainer                = removingElement
                                              = targetElement.parentElement!.insertBefore(createDiv(), targetElement)
      const containerContainerStyle           = containerContainer.style
      containerContainerStyle.display         = 'inline-block'
      containerContainerStyle.position        = 'relative'
      containerContainerStyle.width           = containerContainerStyle.height
                                              = '0'
      containerContainerStyle.cssFloat        = targetStyle.cssFloat
      const containerContainerRect            = containerContainer.getBoundingClientRect()  // this may be a slow operation...
      containerContainer.appendChild(containerElement)
      containerStyle.position                 = 'absolute'
      containerStyle.top                      = `${targetRect.top  - containerContainerRect.top}px`
      containerStyle.left                     = `${targetRect.left - containerContainerRect.left}px`
    } else {
      body.appendChild(containerElement)
      containerStyle.position                 = 'absolute'
      containerStyle.left                     = `${targetRect.left + documentElement.scrollLeft + body.scrollLeft}px`
      containerStyle.top                      = `${targetRect.top  + documentElement.scrollTop  + body.scrollTop}px`
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
      ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'webkitClipPath', 'clipPath']
    )
  }

  {
    const distanceX                         = Math.max(originX - targetRect.left, targetRect.right - originX)
    const distanceY                         = Math.max(originY - targetRect.top, targetRect.bottom - originY)
    const radius                            = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const rippletElement                    = containerElement.appendChild(createDiv())
    const rippletStyle                      = rippletElement.style
    rippletElement.className                = options.className
    rippletStyle.backgroundColor            = options.color
    rippletStyle.width                      = rippletStyle.height
                                            = `${radius * 2}px`
    rippletStyle.marginLeft                 = `${originX - targetRect.left - radius}px`
    rippletStyle.marginTop                  = `${originY - targetRect.top  - radius}px`
    rippletStyle.borderRadius               = '50%'
    rippletStyle.transition                 =
      `transform ${options.spreadingDuration} ${options.spreadingTimingFunction} ${options.spreadingDelay}` +
      `,opacity ${ options.clearingDuration } ${options.clearingTimingFunction } ${options.clearingDelay }`
    rippletStyle.transform                  = 'scale(0)'
    rippletStyle.opacity                    = '1'
    setTimeout(() => {
      rippletStyle.transform                  = 'scale(1)'
      rippletStyle.opacity                    = '0'
    })
    rippletElement.addEventListener('transitionend', event => {
      if ((event as TransitionEvent).propertyName === 'opacity' && removingElement.parentElement) {
        removingElement.parentElement.removeChild(removingElement)
      }
    })
  }
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
  return (Object.keys(defaultOptions) as (keyof RippletOptions)[]).reduce(
    (merged, field) => (merged[field] = options.hasOwnProperty(field) ? options[field]! : defaultOptions[field], merged),
    {} as typeof defaultOptions
  )
}
