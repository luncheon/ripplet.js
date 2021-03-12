export type RippletOptions = Partial<typeof defaultOptions>
export type RippletContainerElement = HTMLElement & { readonly __ripplet__: unique symbol }

export const defaultOptions = {
  className:                '',
  color:                    'currentcolor' as string | null,
  opacity:                  .1             as number | null,
  spreadingDuration:        '.4s'          as string | null,
  spreadingDelay:           '0s'           as string | null,
  spreadingTimingFunction:  'linear'       as string | null,
  clearing:                 true           as boolean | 'true' | 'false' | null,
  clearingDuration:         '1s'           as string | null,
  clearingDelay:            '0s'           as string | null,
  clearingTimingFunction:   'ease-in-out'  as string | null,
  centered:                 false          as boolean | 'true' | 'false' | null,
  appendTo:                 'body'         as 'body' | 'parent' | null,
}

const target2container2ripplet = new Map<Element, Map<RippletContainerElement, HTMLElement>>()

const copyStyles = <T>(destination: T, source: Readonly<T>, properties: (keyof T)[]) => {
  for (const property of properties) {
    destination[property] = source[property]
  }
}

function ripplet(
  targetSuchAsPointerEvent: MouseEvent | Readonly<{ currentTarget: Element, clientX: number, clientY: number }>,
  options?:               Readonly<RippletOptions>,
): RippletContainerElement

function ripplet(
  targetSuchAsPointerEvent: Event | Readonly<{ currentTarget: Element }>,
  options?:               Readonly<RippletOptions>,
): RippletContainerElement | undefined

function ripplet(
  { currentTarget, clientX, clientY }:  Readonly<{ currentTarget: any, clientX?: number, clientY?: number }>,
  _options?:                            Readonly<RippletOptions>,
): RippletContainerElement | undefined {
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
  const containerElement                = document.createElement('div') as any as RippletContainerElement
  const appendToParent                  = options.appendTo === 'parent'
  let removingElement: HTMLElement      = containerElement
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

    const matchColorVariable                = options.color && options.color.match(/^var\((--.+)\)$/)
    rippletStyle.backgroundColor            =
      matchColorVariable
        ? targetStyle.getPropertyValue(matchColorVariable[1])
        : /^currentcolor$/i.test(options.color!)
        ? targetStyle.color
        : options.color!

    rippletElement.className                = options.className
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
      `transform ${options.spreadingDuration} ${options.spreadingTimingFunction} ${options.spreadingDelay
      },opacity ${options.clearingDuration} ${options.clearingTimingFunction} ${options.clearingDelay}`
    rippletStyle.transform                  = 'scale(0)'

    // reflect styles by force layout
    // tslint:disable-next-line:no-unused-expression
    rippletElement.offsetTop
    rippletStyle.transform                  = ''

    rippletElement.addEventListener('transitionend', event => {
      if (event.propertyName === 'opacity' && removingElement.parentElement) {
        removingElement.parentElement.removeChild(removingElement)
      }
    })
    if (options.clearing && options.clearing !== 'false') {
      rippletStyle.opacity                    = '0'
    } else {
      let container2ripplet = target2container2ripplet.get(currentTarget)
      if (!container2ripplet) {
        target2container2ripplet.set(currentTarget, container2ripplet =  new Map<RippletContainerElement, HTMLElement>())
      }
      container2ripplet.set(containerElement, rippletElement)
    }
  }
  return containerElement
}

ripplet.clear = (targetElement?: Element, rippletContainerElement?: RippletContainerElement) => {
  if (targetElement) {
    const container2ripplet = target2container2ripplet.get(targetElement)
    if (container2ripplet) {
      if (rippletContainerElement) {
        const rippletElement = container2ripplet.get(rippletContainerElement)
        rippletElement && (rippletElement.style.opacity = '0')
        container2ripplet.delete(rippletContainerElement)
        container2ripplet.size === 0 && target2container2ripplet.delete(targetElement)
      } else {
        container2ripplet.forEach(r => r.style.opacity = '0')
        target2container2ripplet.delete(targetElement)
      }
    }
  } else {
    target2container2ripplet.forEach(container2ripplet => container2ripplet.forEach(r => r.style.opacity = '0'))
    target2container2ripplet.clear()
  }
}

ripplet.defaultOptions = defaultOptions
ripplet._ripplets = target2container2ripplet

export default ripplet
