import { useEffect, useRef } from "react";

const overlayStack: string[] = [];

export function useHistoryOverlay(
  key: string,
  isOpen: boolean,
  onClose: () => void
) {
  const pushedRef = useRef(false);
  const closedByPopStateRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handlePopState = () => {
      if (pushedRef.current && overlayStack[overlayStack.length - 1] === key) {
        overlayStack.pop();
        pushedRef.current = false;
        closedByPopStateRef.current = true;
        onCloseRef.current();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [key]);

  useEffect(() => {
    if (isOpen) {
      if (!pushedRef.current) {
        overlayStack.push(key);
        window.history.pushState({ unoraOverlay: key }, "");
        pushedRef.current = true;
        closedByPopStateRef.current = false;
      }
    } else {
      if (pushedRef.current) {
        pushedRef.current = false;
        const idx = overlayStack.lastIndexOf(key);
        if (idx !== -1) {
          overlayStack.splice(idx, 1);
        }
        if (!closedByPopStateRef.current) {
          window.history.back();
        }
      }
      closedByPopStateRef.current = false;
    }
  }, [isOpen, key]);
}