export type RippletOptions = Partial<typeof defaultOptions>
export type RippletContainerElement = HTMLElement & { readonly __ripplet__: unique symbol }

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
  appendTo: 'auto' as 'auto' | 'target' | 'parent' | 'body' | string | null,
}

const target2container2ripplet = new Map<Element, Map<RippletContainerElement, HTMLElement>>()

let containerContainerTemplate: HTMLElement

const findElementAppendTo = (target: Element, appendTo: string | null): Element => {
  if (appendTo && appendTo !== 'auto') {
    return appendTo === 'target' ? target : appendTo === 'parent' ? target.parentElement! : document.querySelector(appendTo)!
  }
  while (
    target &&
    (target instanceof SVGElement ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLImageElement ||
      target instanceof HTMLHRElement)
  ) {
    target = target.parentElement!
  }
  return target
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

  if (!containerContainerTemplate) {
    const _containerContainerTemplate = document.createElement('div')
    _containerContainerTemplate.innerHTML =
      '<div style="float:left;position:relative;isolation:isolate;pointer-events:none"><div style="position:absolute;overflow:hidden;transform-origin:0 0"><div style="border-radius:50%;transform:scale(0)"></div></div></div>'
    containerContainerTemplate = _containerContainerTemplate.firstChild as HTMLElement
  }

  const targetRect = currentTarget.getBoundingClientRect()
  if (options.centered && options.centered !== 'false') {
    clientX = targetRect.left + targetRect.width * 0.5
    clientY = targetRect.top + targetRect.height * 0.5
  } else if (typeof clientX !== 'number' || typeof clientY !== 'number') {
    return
  } else {
    const zoomReciprocal = 1 / (+getComputedStyle(document.body).zoom || 1)
    clientX = clientX * zoomReciprocal
    clientY = clientY * zoomReciprocal
  }
  const targetStyle = getComputedStyle(currentTarget)
  const applyCssVariable = (value: string | null | undefined) => {
    const match = value && /^var\((--.+)\)$/.exec(value)
    return match ? targetStyle.getPropertyValue(match[1]!) : value
  }
  const elementAppendTo = findElementAppendTo(currentTarget, options.appendTo)

  const containerContainerElement: RippletContainerElement = elementAppendTo.appendChild(containerContainerTemplate.cloneNode(true)) as any
  containerContainerElement.style.zIndex = ((+targetStyle.zIndex || 0) + 1) as string & number
  const containerElement = containerContainerElement.firstChild as HTMLElement
  {
    let containerRect = containerElement.getBoundingClientRect()
    const containerStyle = containerElement.style
    containerStyle.top = `${targetRect.top - containerRect.top}px`
    containerStyle.left = `${targetRect.left - containerRect.left}px`
    containerStyle.width = `${targetRect.width}px`
    containerStyle.height = `${targetRect.height}px`
    containerStyle.opacity = applyCssVariable(options.opacity as string & number)!
    containerStyle.borderTopLeftRadius = targetStyle.borderTopLeftRadius
    containerStyle.borderTopRightRadius = targetStyle.borderTopRightRadius
    containerStyle.borderBottomLeftRadius = targetStyle.borderBottomLeftRadius
    containerStyle.borderBottomRightRadius = targetStyle.borderBottomRightRadius
    containerStyle.clipPath = targetStyle.clipPath

    containerRect = containerElement.getBoundingClientRect()
    const scaleX = targetRect.width / containerRect.width
    const scaleY = targetRect.height / containerRect.height
    containerStyle.transform = `scale(${scaleX},${scaleY}) translate(${targetRect.left - containerRect.left}px,${
      targetRect.top - containerRect.top
    }px)`
  }
  {
    const distanceX = Math.max(clientX - targetRect.left, targetRect.right - clientX)
    const distanceY = Math.max(clientY - targetRect.top, targetRect.bottom - clientY)
    const radius = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

    const rippletElement = containerElement.firstChild as HTMLElement
    const rippletStyle = rippletElement.style

    const color = applyCssVariable(options.color)!
    rippletStyle.backgroundColor = /^currentcolor$/i.test(color) ? targetStyle.color : color

    rippletElement.className = options.className
    rippletStyle.width = rippletStyle.height = `${radius + radius}px`
    if (getComputedStyle(elementAppendTo).direction === 'rtl') {
      rippletStyle.marginRight = `${targetRect.right - clientX - radius}px`
    } else {
      rippletStyle.marginLeft = `${clientX - targetRect.left - radius}px`
    }
    rippletStyle.marginTop = `${clientY - targetRect.top - radius}px`
    rippletStyle.transition = `transform ${applyCssVariable(options.spreadingDuration)} ${applyCssVariable(
      options.spreadingTimingFunction,
    )} ${applyCssVariable(options.spreadingDelay)},opacity ${applyCssVariable(options.clearingDuration)} ${applyCssVariable(
      options.clearingTimingFunction,
    )} ${applyCssVariable(options.clearingDelay)}`

    rippletElement.addEventListener('transitionend', event => {
      if (event.propertyName === 'opacity' && containerContainerElement.parentElement) {
        containerContainerElement.parentElement.removeChild(containerContainerElement)
      }
    })
    if (options.clearing && options.clearing !== 'false') {
      rippletStyle.opacity = '0'
    } else {
      let container2ripplet = target2container2ripplet.get(currentTarget)
      if (!container2ripplet) {
        target2container2ripplet.set(currentTarget, (container2ripplet = new Map<RippletContainerElement, HTMLElement>()))
      }
      container2ripplet.set(containerContainerElement, rippletElement)
    }

    // reflect styles by force layout and start transition
    rippletElement.offsetWidth // tslint:disable-line:no-unused-expression
    rippletStyle.transform = ''
  }
  return containerContainerElement
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
