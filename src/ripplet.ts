export type RippletOptions = Partial<typeof defaultOptions>
export type RippletContainerElement = HTMLElement & { readonly __ripplet__: unique symbol }

declare const MSCSSMatrix: typeof DOMMatrixReadOnly
// tslint:disable-next-line:variable-name
const Matrix = typeof DOMMatrix !== 'undefined' ? DOMMatrix : typeof MSCSSMatrix !== 'undefined' ? MSCSSMatrix : (undefined as never)

const transformPoint = (matrix: DOMMatrixReadOnly | undefined, x: number, y: number) => {
  // IE doesn't support `DOMPoint` (and of course `DOMMatrix.prototype.transformPoint()` and `DOMPoint.prototype.matrixTransform()`).
  if (matrix) {
    const m = matrix.multiply(new Matrix().translate(x, y))
    return { x: m.e, y: m.f }
  } else {
    return { x, y }
  }
}

const createTransformMatrix = (style: CSSStyleDeclaration) => {
  if (style.transform === 'none') {
    return
  }
  const origin = style.transformOrigin.split(' ')
  const xOrigin = parseFloat(origin[0])
  const yOrigin = parseFloat(origin[1])
  return new Matrix()
    .translate(xOrigin + parseFloat(style.marginLeft), yOrigin + parseFloat(style.marginTop))
    .multiply(new Matrix(style.transform))
    .translate(-xOrigin, -yOrigin)
    .inverse()
}

const createScaleMatrix = (style: CSSStyleDeclaration) => {
  if (style.transform === 'none') {
    return
  }
  const matrix = new Matrix(style.transform)
  return matrix.translate(-matrix.e, -matrix.f).inverse()
}

export const defaultOptions = {
  className: '',
  color: 'currentcolor' as string | null,
  opacity: 0.1 as number | null,
  spreadingDuration: '.4s' as string | null,
  spreadingDelay: '0s' as string | null,
  spreadingTimingFunction: 'linear' as string | null,
  clearing: true as boolean | 'true' | 'false' | null,
  clearingDuration: '1s' as string | null,
  clearingDelay: '0s' as string | null,
  clearingTimingFunction: 'ease-in-out' as string | null,
  centered: false as boolean | 'true' | 'false' | null,
  appendTo: 'body' as 'body' | 'parent' | null,
}

const target2container2ripplet = new Map<Element, Map<RippletContainerElement, HTMLElement>>()

const copyStyles = <T>(destination: T, source: Readonly<T>, properties: (keyof T)[]) => {
  for (const property of properties) {
    destination[property] = source[property]
  }
}

function ripplet(
  targetSuchAsPointerEvent: MouseEvent | Readonly<{ currentTarget: Element; clientX: number; clientY: number }>,
  options?: Readonly<RippletOptions>,
): RippletContainerElement

function ripplet(
  targetSuchAsPointerEvent: Event | Readonly<{ currentTarget: Element }>,
  options?: Readonly<RippletOptions>,
): RippletContainerElement | undefined

function ripplet(
  { currentTarget, clientX, clientY }: Readonly<{ currentTarget: any; clientX?: number; clientY?: number }>,
  _options?: Readonly<RippletOptions>,
): RippletContainerElement | undefined {
  if (!(currentTarget instanceof Element)) {
    return
  }
  const options: typeof defaultOptions = _options
    ? (Object.keys(defaultOptions) as (keyof RippletOptions)[]).reduce<any>(
        (merged, field) => ((merged[field] = _options.hasOwnProperty(field) ? _options[field] : defaultOptions[field]), merged),
        {},
      )
    : defaultOptions
  const { documentElement, body } = document
  const bodyStyle = getComputedStyle(body)
  const zoom = +bodyStyle.zoom || 1
  const zoomReciprocal = 1 / zoom
  const transformMatrix = createTransformMatrix(bodyStyle)
  const targetRect = currentTarget.getBoundingClientRect()
  if (options.centered && options.centered !== 'false') {
    clientX = targetRect.left + targetRect.width * 0.5
    clientY = targetRect.top + targetRect.height * 0.5
  } else if (typeof clientX !== 'number' || typeof clientY !== 'number') {
    return
  } else {
    clientX = clientX * zoomReciprocal
    clientY = clientY * zoomReciprocal
  }
  const targetStyle = getComputedStyle(currentTarget)
  const applyCssVariable = (value: string | null | undefined) => {
    const match = value && /^var\((--.+)\)$/.exec(value)
    return match ? targetStyle.getPropertyValue(match[1]) : value
  }
  const containerElement = (document.createElement('div') as any) as RippletContainerElement
  const appendToParent = options.appendTo === 'parent'
  let removingElement: HTMLElement = containerElement
  {
    const containerStyle = containerElement.style
    if (targetStyle.position === 'fixed' || (targetStyle.position === 'absolute' && appendToParent)) {
      if (appendToParent) {
        currentTarget.parentElement!.insertBefore(containerElement, currentTarget)
      } else {
        body.appendChild(containerElement)
      }
      copyStyles(containerStyle, targetStyle, [
        'position',
        'left',
        'top',
        'right',
        'bottom',
        'marginLeft',
        'marginTop',
        'marginRight',
        'marginBottom',
      ])
    } else if (appendToParent) {
      const parentStyle = getComputedStyle(currentTarget.parentElement!)
      if (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') {
        currentTarget.parentElement!.insertBefore(containerElement, currentTarget)
        containerStyle.position = 'absolute'
        containerStyle.left = `${(currentTarget as HTMLElement).offsetLeft}px`
        containerStyle.top = `${(currentTarget as HTMLElement).offsetTop}px`
      } else {
        const containerContainer = (removingElement = currentTarget.parentElement!.insertBefore(
          document.createElement('div'),
          currentTarget,
        ))
        const containerContainerStyle = containerContainer.style
        containerContainerStyle.cssFloat = 'left'
        containerContainerStyle.position = 'relative'
        const containerContainerRect = containerContainer.getBoundingClientRect() // this may be a slow operation...
        containerContainer.appendChild(containerElement)
        containerStyle.position = 'absolute'
        containerStyle.top = `${targetRect.top - containerContainerRect.top}px`
        containerStyle.left = `${targetRect.left - containerContainerRect.left}px`
      }
    } else {
      body.appendChild(containerElement)
      containerStyle.position = 'absolute'
      const p = transformPoint(
        transformMatrix,
        targetRect.left + documentElement.scrollLeft + body.scrollLeft * zoomReciprocal,
        targetRect.top + documentElement.scrollTop + body.scrollTop * zoomReciprocal,
      )
      containerStyle.left = `${p.x}px`
      containerStyle.top = `${p.y}px`
    }
    {
      const size = transformPoint(createScaleMatrix(bodyStyle), targetRect.width, targetRect.height)
      containerStyle.width = `${size.x}px`
      containerStyle.height = `${size.y}px`
    }
    containerStyle.overflow = 'hidden'
    containerStyle.pointerEvents = 'none'
    containerStyle.zIndex = ((+targetStyle.zIndex || 0) + 1) as string & number
    containerStyle.opacity = applyCssVariable(options.opacity as string & number)!
    copyStyles(containerStyle, targetStyle, [
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
      'webkitClipPath',
      'clipPath',
    ])
  }

  {
    const p1 = transformPoint(transformMatrix, targetRect.left, targetRect.top)
    const p2 = transformPoint(transformMatrix, targetRect.right, targetRect.bottom)
    const client = transformPoint(transformMatrix, clientX, clientY)
    const distanceX = Math.max(client.x - p1.x, p2.x - client.x)
    const distanceY = Math.max(client.y - p1.y, p2.y - client.y)
    const radius = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const rippletElement = document.createElement('div')
    const rippletStyle = rippletElement.style

    const color = applyCssVariable(options.color)!
    rippletStyle.backgroundColor = /^currentcolor$/i.test(color) ? targetStyle.color : color

    rippletElement.className = options.className
    rippletStyle.width = rippletStyle.height = `${radius * 2}px`
    if (getComputedStyle(appendToParent ? currentTarget.parentElement! : body).direction === 'rtl') {
      rippletStyle.marginRight = `${p2.x - client.x - radius}px`
    } else {
      rippletStyle.marginLeft = `${client.x - p1.x - radius}px`
    }
    rippletStyle.marginTop = `${client.y - p1.y - radius}px`
    rippletStyle.borderRadius = '50%'
    rippletStyle.transition = `transform ${applyCssVariable(options.spreadingDuration)} ${applyCssVariable(
      options.spreadingTimingFunction,
    )} ${applyCssVariable(options.spreadingDelay)},opacity ${applyCssVariable(options.clearingDuration)} ${applyCssVariable(
      options.clearingTimingFunction,
    )} ${applyCssVariable(options.clearingDelay)}`
    rippletStyle.transform = 'scale(0)'

    containerElement.appendChild(rippletElement)
    // reflect styles by force layout
    // tslint:disable-next-line:no-unused-expression
    rippletElement.offsetTop
    rippletStyle.transform = ''

    rippletElement.addEventListener('transitionend', event => {
      if (event.propertyName === 'opacity' && removingElement.parentElement) {
        removingElement.parentElement.removeChild(removingElement)
      }
    })
    if (options.clearing && options.clearing !== 'false') {
      rippletStyle.opacity = '0'
    } else {
      let container2ripplet = target2container2ripplet.get(currentTarget)
      if (!container2ripplet) {
        target2container2ripplet.set(currentTarget, (container2ripplet = new Map<RippletContainerElement, HTMLElement>()))
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
        container2ripplet.forEach(r => (r.style.opacity = '0'))
        target2container2ripplet.delete(targetElement)
      }
    }
  } else {
    target2container2ripplet.forEach(container2ripplet => container2ripplet.forEach(r => (r.style.opacity = '0')))
    target2container2ripplet.clear()
  }
}

ripplet.defaultOptions = defaultOptions
ripplet._ripplets = target2container2ripplet

export default ripplet
