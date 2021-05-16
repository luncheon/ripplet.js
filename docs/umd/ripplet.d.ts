export declare type RippletOptions = Partial<typeof defaultOptions>;
export declare type RippletContainerElement = HTMLElement & {
    readonly __ripplet__: unique symbol;
};
export declare const defaultOptions: {
    className: string;
    color: string | null;
    opacity: number | null;
    spreadingDuration: string | null;
    spreadingDelay: string | null;
    spreadingTimingFunction: string | null;
    clearing: boolean | "true" | "false" | null;
    clearingDuration: string | null;
    clearingDelay: string | null;
    clearingTimingFunction: string | null;
    centered: boolean | "true" | "false" | null;
    appendTo: string | null;
};
declare function ripplet(targetSuchAsPointerEvent: MouseEvent | Readonly<{
    currentTarget: Element;
    clientX: number;
    clientY: number;
}>, options?: Readonly<RippletOptions>): RippletContainerElement;
declare namespace ripplet {
    var clear: (targetElement?: Element | undefined, rippletContainerElement?: RippletContainerElement | undefined) => void;
    var defaultOptions: {
        className: string;
        color: string | null;
        opacity: number | null;
        spreadingDuration: string | null;
        spreadingDelay: string | null;
        spreadingTimingFunction: string | null;
        clearing: boolean | "true" | "false" | null;
        clearingDuration: string | null;
        clearingDelay: string | null;
        clearingTimingFunction: string | null;
        centered: boolean | "true" | "false" | null;
        appendTo: string | null;
    };
    var _ripplets: Map<Element, Map<RippletContainerElement, HTMLElement>>;
}
declare function ripplet(targetSuchAsPointerEvent: Event | Readonly<{
    currentTarget: Element;
}>, options?: Readonly<RippletOptions>): RippletContainerElement | undefined;
declare namespace ripplet {
    var clear: (targetElement?: Element | undefined, rippletContainerElement?: RippletContainerElement | undefined) => void;
    var defaultOptions: {
        className: string;
        color: string | null;
        opacity: number | null;
        spreadingDuration: string | null;
        spreadingDelay: string | null;
        spreadingTimingFunction: string | null;
        clearing: boolean | "true" | "false" | null;
        clearingDuration: string | null;
        clearingDelay: string | null;
        clearingTimingFunction: string | null;
        centered: boolean | "true" | "false" | null;
        appendTo: string | null;
    };
    var _ripplets: Map<Element, Map<RippletContainerElement, HTMLElement>>;
}
export default ripplet;
