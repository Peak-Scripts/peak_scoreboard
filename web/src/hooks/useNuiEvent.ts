import { useEffect, useRef } from "react";
import { noop, isEnvBrowser } from "../utils/misc";

interface NuiMessageData<T = unknown> {
  action: string;
  data?: T;
  show?: boolean;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * A hook that manages the registration and cleanup of a NUI event listener.
 * @param action The specific `action` that should be listened for.
 * @param handler The callback function that will handle the event.
 */
export const useNuiEvent = <T = any>(
  action: string,
  handler: (data: T) => void
) => {
  const savedHandler = useRef<NuiHandlerSignature<T>>(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: MessageEvent<NuiMessageData<T>>) => {
      const { action: eventAction, data, show } = event.data;

      if (eventAction === action) {
        if (action === 'setVisible' && show !== undefined) {
          savedHandler.current(show as T);
        } 
        else if (data) {
          savedHandler.current(data);
        }
      } else {
        console.warn(`%cUnmatched NUI Event: ${eventAction} (expected: ${action})`, 'color: red;');
      }
    };

    if (isEnvBrowser()) {
      console.warn('Running in browser mode, skipping NUI event setup');
      return;
    }

    window.addEventListener("message", eventListener);
    return () => window.removeEventListener("message", eventListener);
  }, [action]);
};
