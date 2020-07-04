export type RippletOptions = Readonly<typeof defaultOptions>

export const defaultOptions = {
  className:                '',
  color:                    'currentcolor' as string | null,
  opacity:                  .1             as number | null,
  spreadingDuration:        '.4s'          as string | null,
  spreadingDelay:           '0s'           as string | null,
  spreadingTimingFunction:  'linear'       as string | null,
  clearingDuration:         '1s'           as string | null,
  clearingDelay:            '0s'           as string | null,
  clearingTimingFunction:   'ease-in-out'  as string | null,
  centered:                 false          as boolean | 'true' | 'false' | null,
  appendTo:                 'body'         as 'body' | 'parent' | null,
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
  { currentTarget, clientX, clientY }:  Readonly<{ currentTarget: any, clientX?: number, clientY?: number }>,
  _options?:                            Partial<RippletOptions>,
): HTMLElement | undefined {
  if (!(currentTarget instanceof Element)) {
    return
  }
  const options: typeof defaultOptions = _options
    ? (Object.keys(defaultOptions) as (keyof RippletOptions)[]).reduce<any>(
        (merged, field) => (merged[field] = _options.hasOwnProperty(field) ? _options[field] : defaultOptions[field], merged),
        {}
      )
    : defaultOptions
  const targetRect = currentTarget.getBoundingClientRect()
  if (options.centered && options.centered !== 'false') {
    clientX = targetRect.left + targetRect.width  * .5
    clientY = targetRect.top  + targetRect.height * .5
  } else if (typeof clientX !== 'number' || typeof clientY !== 'number') {
    return
  }

  const targetStyle                     = getComputedStyle(currentTarget)
  const { documentElement, body }       = document
  const containerElement                = document.createElement('div')
  const appendToParent                  = options.appendTo === 'parent'
  let removingElement                   = containerElement
  {
    const containerStyle                = containerElement.style
    if (targetStyle.position === 'fixed' || (targetStyle.position === 'absolute' && appendToParent)) {
      if (appendToParent) {
        currentTarget.parentElement!.insertBefore(containerElement, currentTarget)
      } else {
        body.appendChild(containerElement)
      }
      copyStyles(
        containerStyle,
        targetStyle,
        ['position', 'left', 'top', 'right', 'bottom', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom']
      )
    } else if (appendToParent) {
      const parentStyle = getComputedStyle(currentTarget.parentElement!)
      if (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') {
        currentTarget.parentElement!.insertBefore(containerElement, currentTarget)
        containerStyle.position                 = 'absolute'
        containerStyle.left                     = `${(currentTarget as HTMLElement).offsetLeft}px`
        containerStyle.top                      = `${(currentTarget as HTMLElement).offsetTop}px`
      } else {
        const containerContainer                = removingElement
                                                = currentTarget.parentElement!.insertBefore(document.createElement('div'), currentTarget)
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
      }
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
    containerStyle.zIndex                   = (+targetStyle.zIndex || 0) + 1 as string & number
    containerStyle.opacity                  = options.opacity as string & number
    copyStyles(
      containerStyle,
      targetStyle,
      ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'webkitClipPath', 'clipPath']
    )
  }

  {
    const distanceX                         = Math.max(clientX - targetRect.left, targetRect.right - clientX)
    const distanceY                         = Math.max(clientY - targetRect.top, targetRect.bottom - clientY)
    const radius                            = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const rippletElement                    = containerElement.appendChild(document.createElement('div'))
    const rippletStyle                      = rippletElement.style
    rippletElement.className                = options.className
    rippletStyle.backgroundColor            = /^currentcolor$/i.test(options.color!) ? targetStyle.color : options.color!
    rippletStyle.width                      = rippletStyle.height
                                            = `${radius * 2}px`
    if (getComputedStyle(appendToParent ? currentTarget.parentElement! : body).direction === 'rtl') {
      rippletStyle.marginRight                = `${targetRect.right - clientX - radius}px`
    } else {
      rippletStyle.marginLeft                 = `${clientX - targetRect.left - radius}px`
    }
    rippletStyle.marginTop                  = `${clientY - targetRect.top  - radius}px`
    rippletStyle.borderRadius               = '50%'
    rippletStyle.transition                 =
      `transform ${options.spreadingDuration} ${options.spreadingTimingFunction} ${options.spreadingDelay}` +
      `,opacity ${ options.clearingDuration } ${options.clearingTimingFunction } ${options.clearingDelay }`
    rippletStyle.transform                  = 'scale(0)'

    // reflect styles by force layout
    // tslint:disable-next-line:no-unused-expression
    rippletElement.offsetTop

    rippletElement.addEventListener('transitionend', event => {
      if (event.propertyName === 'opacity' && removingElement.parentElement) {
        removingElement.parentElement.removeChild(removingElement)
      }
    })
    rippletStyle.transform                  = ''
    rippletStyle.opacity                    = '0'
  }
  return containerElement
}

function copyStyles<T>(destination: T, source: Readonly<T>, properties: (keyof T)[]) {
  for (const property of properties) {
    destination[property] = source[property]
  }
}
