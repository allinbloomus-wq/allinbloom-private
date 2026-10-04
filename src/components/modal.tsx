"use client";

import {
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string;
  panelClassName?: string;
  closeLabel?: string;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0
  );
}

/**
 * A shared accessible dialog for content such as legal notices and embedded video.
 * It traps keyboard focus while open and returns focus to the invoking control on close.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  description,
  panelClassName = "max-w-2xl",
  closeLabel = "Close dialog",
}: ModalProps) {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot
  );
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [isScrolled, setIsScrolled] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !isClient) return;

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusDialog = () => {
      (closeButtonRef.current ?? dialogRef.current)?.focus({ preventScroll: true });
    };
    const animationFrame = window.requestAnimationFrame(focusDialog);

    const handleKeyDown = (event: KeyboardEvent) => {
      // A dialog opened on top (e.g. an image lightbox) owns the keyboard.
      const dialogs = document.querySelectorAll('[aria-modal="true"]');
      if (Array.from(dialogs).some((dialog) => dialog !== dialogRef.current)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = getFocusableElements(dialogRef.current);
      if (!focusableElements.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !dialogRef.current.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;

      const previousActiveElement = previousActiveElementRef.current;
      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus({ preventScroll: true });
      }
      previousActiveElementRef.current = null;
    };
  }, [isClient, open]);

  if (!open || !isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-stone-900/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`glass flex max-h-[min(44rem,calc(100dvh-2rem))] w-full flex-col overflow-hidden rounded-[28px] border border-white/80 shadow-2xl ${panelClassName}`}
      >
        {/* The header stays put across the full width; only the body scrolls. */}
        <div
          className={`flex shrink-0 items-start justify-between gap-4 border-b border-stone-200/80 px-5 pb-4 pt-5 transition-shadow sm:px-7 sm:pt-7 ${
            isScrolled ? "shadow-[0_10px_20px_-16px_rgba(36,40,32,0.55)]" : ""
          }`}
        >
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl text-stone-900 sm:text-2xl">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => onCloseRef.current()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-stone-600 transition hover:border-stone-300 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
            aria-label={closeLabel}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div
          className="modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-7 sm:pb-7"
          onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 4)}
        >
          <div className="pt-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
