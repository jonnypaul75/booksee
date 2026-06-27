import { useEffect, useRef, useState } from 'react';

/**
 * Tracks which item in a list is "most visible" inside a scroll container.
 * Used to autoplay only the centered preview, not every visible row.
 *
 * Usage:
 *   const { activeId, registerItem } = useActiveScrollItem<number>(scrollRef);
 *   <div ref={(el) => registerItem(item.id, el)} />
 */
export function useActiveScrollItem<TId extends string | number>(
  scrollRef: React.RefObject<HTMLElement>
) {
  const [activeId, setActiveId] = useState<TId | null>(null);
  const ratiosRef = useRef<Map<TId, number>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Map of registered nodes so we can re-observe after scrollRef changes.
  const nodesRef = useRef<Map<TId, Element>>(new Map());

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const recompute = () => {
      let bestId: TId | null = null;
      let best = 0;
      ratiosRef.current.forEach((ratio, id) => {
        if (ratio > best) {
          best = ratio;
          bestId = id;
        }
      });
      setActiveId((prev) => (prev === bestId ? prev : bestId));
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.activeKey as TId | undefined;
          if (id == null) continue;
          ratiosRef.current.set(id as TId, e.isIntersecting ? e.intersectionRatio : 0);
        }
        recompute();
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observerRef.current = io;

    // Re-observe everything that was registered before the observer existed.
    nodesRef.current.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      observerRef.current = null;
    };
  }, [scrollRef]);

  const registerItem = (id: TId, el: HTMLElement | null) => {
    const prev = nodesRef.current.get(id);
    if (prev === el) return;

    if (prev) {
      observerRef.current?.unobserve(prev);
      nodesRef.current.delete(id);
      ratiosRef.current.delete(id);
    }
    if (el) {
      el.dataset.activeKey = String(id);
      nodesRef.current.set(id, el);
      observerRef.current?.observe(el);
    }
  };

  return { activeId, registerItem };
}
