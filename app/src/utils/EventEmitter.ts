import { useEffect } from "react";

class GlobalEventEmitter extends EventTarget { }
export const globalEventEmitter = new GlobalEventEmitter();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEventEmitter = (eventName: string, callback: any) => {
    useEffect(() => {
        globalEventEmitter.addEventListener(eventName, callback);
        return () => globalEventEmitter.removeEventListener(eventName, callback);
    }, [eventName, callback]);
};
