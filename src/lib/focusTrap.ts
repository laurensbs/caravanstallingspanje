'use client';

import { useEffect, type RefObject } from 'react';

// Minimale focus-trap util voor onze dialogs/drawers. Geen externe dep.
// Behaviour:
//   - Op mount: focus eerste tabbable binnen container (of de container zelf
//     als die tabIndex=-1 heeft).
//   - Tab/Shift+Tab cycled binnen container — laat focus niet ontsnappen.
//   - Op unmount: herstelt focus naar het element dat 'm voor de mount had.
//
// Gebruik:
//   const ref = useRef<HTMLDivElement>(null);
//   useFocusTrap(ref, { active: open });

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  { active = true }: { active?: boolean } = {},
): void {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Eerste-mount focus: kies eerste tabbable, anders container zelf.
    const focusables = getFocusable(node);
    if (focusables.length > 0) {
      focusables[0].focus({ preventScroll: true });
    } else if (node.tabIndex >= 0 || node.hasAttribute('tabindex')) {
      node.focus({ preventScroll: true });
    }

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const list = getFocusable(node!);
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !node!.contains(active)) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    }

    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [ref, active]);
}
