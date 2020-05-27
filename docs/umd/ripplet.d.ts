export declare type RippletOptions = Readonly<typeof defaultOptions>;
export declare const defaultOptions: {
    className: string;
    color: string | null;
    opacity: number | null;
    spreadingDuration: string | null;
    spreadingDelay: string | null;
    spreadingTimingFunction: string | null;
    clearingDuration: string | null;
    clearingDelay: string | null;
    clearingTimingFunction: string | null;
    centered: boolean | "true" | "false" | null;
    appendTo: "body" | "parent" | null;
};
export default function ripplet(targetSuchAsMouseEvent: MouseEvent | Readonly<{
    currentTarget: Element;
    clientX: number;
    clientY: number;
}>, options?: Partial<RippletOptions>): HTMLElement;
export default function ripplet(targetSuchAsMouseEvent: Event | Readonly<{
    currentTarget: Element;
}>, options?: Partial<RippletOptions>): HTMLElement | undefined;
