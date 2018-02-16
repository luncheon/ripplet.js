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
  {
    currentTarget: targetElement,
    clientX: originX,
    clientY: originY,
  }:  Readonly<{ currentTarget: Element | EventTarget, clientX?: number, clientY?: number }>,
  options?:                             Partial<RippletOptions>,
): HTMLElement | undefined {
  if (!(targetElement instanceof Element)) {
    return
  }

  const mergedOptions = mergeDefaultOptions(options)
  let {
    left:   targetLeft,
    top:    targetTop,
    width:  targetWidth,
    height: targetHeight,
  } = targetElement.getBoundingClientRect()

  if (mergedOptions.centered && mergedOptions.centered !== 'false') {
    originX = targetLeft + targetWidth  * .5
    originY = targetTop  + targetHeight * .5
  } else if (typeof originX !== 'number' || typeof originY !== 'number') {
    return
  }

  const doc                             = document
  const { documentElement, body }       = doc
  const createDiv: () => HTMLDivElement = doc.createElement.bind(doc, 'div')
  const win = window as any
  const DOMMatrix: typeof WebKitCSSMatrix = win.DOMMatrix || win.WebKitCSSMatrix || win.MSCSSMatrix // tslint:disable-line:variable-name
  const targetStyle                     = getComputedStyle(targetElement)
  const containerElement                = createDiv()
  const containerStyle                  = containerElement.style

  // resolve transform
  // based on https://www.w3.org/TR/css-transforms/#transform-rendering
  const transform                       = targetStyle.transform
  if (DOMMatrix && targetElement instanceof HTMLElement && transform && transform !== 'none') {
    targetWidth                           = targetElement.offsetWidth
    targetHeight                          = targetElement.offsetHeight
    const transformOrigin                 = targetStyle.transformOrigin!.split(' ').map(parseFloat)
    const matrix                          = new DOMMatrix()
      .translate(transformOrigin[0], transformOrigin[1], transformOrigin[2])
      .multiply(new DOMMatrix(transform))
      .translate(-transformOrigin[0], -transformOrigin[1], transformOrigin[2] && -transformOrigin[2])
    const translated10                    = matrix.translate(targetWidth, 0, 0)
    const translated01                    = matrix.translate(0, targetHeight, 0)
    const translated11                    = matrix.translate(targetWidth, targetHeight, 0)
    targetLeft                            -= Math.min(matrix.m41, translated01.m41, translated10.m41, translated11.m41)
    targetTop                             -= Math.min(matrix.m42, translated01.m42, translated10.m42, translated11.m42)
    const point                           = matrix.inverse().translate(originX - targetLeft, originY - targetTop)
    originX                               = point.m41 + targetLeft
    originY                               = point.m42 + targetTop

    containerStyle.transform              = targetStyle.transform
    containerStyle.transformOrigin        = targetStyle.transformOrigin
  }

  let removingElement                     = containerElement
  {
    const appendToParent                    = mergedOptions.appendTo === 'parent'
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
      containerStyle.left                     = `${targetLeft - containerContainerRect.left}px`
      containerStyle.top                      = `${targetTop  - containerContainerRect.top}px`
    } else {
      body.appendChild(containerElement)
      containerStyle.position                 = 'absolute'
      containerStyle.left                     = `${targetLeft + documentElement.scrollLeft + body.scrollLeft}px`
      containerStyle.top                      = `${targetTop  + documentElement.scrollTop  + body.scrollTop}px`
    }
    containerStyle.overflow                 = 'hidden'
    containerStyle.pointerEvents            = 'none'
    containerStyle.width                    = `${targetWidth}px`
    containerStyle.height                   = `${targetHeight}px`
    containerStyle.zIndex                   = `${(parseInt(targetStyle.zIndex as any, 10) || 0) + 1}`
    containerStyle.opacity                  = mergedOptions.opacity
    copyStyles(
      containerStyle,
      targetStyle,
      ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'webkitClipPath', 'clipPath']
    )
  }

  {
    const distanceX                         = Math.max(originX - targetLeft, targetLeft + targetWidth - originX)
    const distanceY                         = Math.max(originY - targetTop, targetTop + targetHeight - originY)
    const radius                            = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const rippletElement                    = containerElement.appendChild(createDiv())
    const rippletStyle                      = rippletElement.style
    rippletElement.className                = mergedOptions.className
    rippletStyle.backgroundColor            = mergedOptions.color
    rippletStyle.width                      = rippletStyle.height
                                            = `${radius * 2}px`
    rippletStyle.marginLeft                 = `${originX - targetLeft - radius}px`
    rippletStyle.marginTop                  = `${originY - targetTop  - radius}px`
    rippletStyle.borderRadius               = '50%'
    rippletStyle.transition                 =
      `transform ${mergedOptions.spreadingDuration} ${mergedOptions.spreadingTimingFunction} ${mergedOptions.spreadingDelay}` +
      `,opacity ${ mergedOptions.clearingDuration } ${mergedOptions.clearingTimingFunction } ${mergedOptions.clearingDelay }`
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
