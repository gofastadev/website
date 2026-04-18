"use client";

import { useEffect, useRef, useState } from "react";

interface UseOnScreenOptions {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/**
 * useOnScreen — IntersectionObserver-backed hook that reports whether the
 * attached element is in the viewport. `once: true` latches to `true` after
 * the first intersection so entrance animations don't re-run on scroll-out.
 */
export function useOnScreen<T extends HTMLElement>(
  options: UseOnScreenOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { rootMargin = "0px 0px -10% 0px", threshold = 0.1, once = true } =
    options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, visible];
}
