import { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import './ServicesStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className="scroll-stack-card-wrapper">
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
  </div>
);

const ScrollStack = ({
  children,
  className = '',
  itemScale = 0.05,
  itemStackDistance = 20,
  stackPosition = '10%',
  baseScale = 0.9,
  blurAmount = 0,
  useWindowScroll = true,
  onStackComplete,
}) => {
  const scrollerRef = useRef(null);
  const cardsRef = useRef([]);
  const cardOffsets = useRef([]);
  const stackCompletedRef = useRef(false);

  const updateCardTransforms = useCallback(
    (scrollTop) => {
      if (!cardsRef.current.length) return;

      const containerHeight = window.innerHeight;
      const stackPositionPx = (parseFloat(stackPosition) / 100) * containerHeight;

      // Compute where the whole stack section ends so cards can scroll away naturally.
      // We use the bottom of the scroller container as the release point.
      const scroller = scrollerRef.current;
      const stackBottom = scroller
        ? scroller.getBoundingClientRect().bottom + scrollTop
        : Infinity;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const cardTop = cardOffsets.current[i];
        const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;

        // --- Scale ---
        const scrollDistance = scrollTop - triggerStart;
        const progress = Math.min(Math.max(scrollDistance / 500, 0), 1);
        const targetScale = baseScale + i * itemScale;
        const currentScale = 1 - progress * (1 - targetScale);

        // --- translateY (pinning) ---
        let translateY = 0;

        if (scrollTop >= triggerStart) {
          // How far past the trigger we've scrolled — this is the "pin" offset.
          const pinOffset = scrollTop - triggerStart;

          // Upper clamp: don't let the card travel past where the NEXT card starts to pin.
          // This prevents earlier cards from sliding under later ones incorrectly.
          let maxPin = Infinity;
          if (cardOffsets.current[i + 1] !== undefined) {
            const nextTrigger =
              cardOffsets.current[i + 1] -
              stackPositionPx -
              itemStackDistance * (i + 1);
            maxPin = nextTrigger - triggerStart;
          }

          // Lower clamp: once the stack section scrolls out of view,
          // let the card travel upward with the page by subtracting the
          // overshoot beyond the stack's bottom boundary.
          //
          // stackBottom is the bottom edge of the ScrollStack container.
          // When scrollTop exceeds stackBottom, the section has left the viewport,
          // and we release the pin so the card moves up naturally with the page.
          let releaseOffset = 0;
          if (stackBottom !== Infinity && scrollTop > stackBottom - containerHeight) {
            releaseOffset = scrollTop - (stackBottom - containerHeight);
          }

          translateY = Math.min(pinOffset, maxPin) - releaseOffset;
          translateY = Math.max(translateY, 0); // never go negative (upward past origin)
        }

        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${currentScale})`;

        if (blurAmount) {
          const nextCardTrigger = cardOffsets.current[i + 1]
            ? cardOffsets.current[i + 1] - stackPositionPx
            : Infinity;
          card.style.filter =
            scrollTop > nextCardTrigger ? `blur(${blurAmount}px)` : 'none';
        }

        // Completion callback on last card
        if (i === cardsRef.current.length - 1 && scrollTop >= triggerStart) {
          if (!stackCompletedRef.current) {
            stackCompletedRef.current = true;
            onStackComplete?.();
          }
        }
      });
    },
    [baseScale, itemScale, itemStackDistance, stackPosition, blurAmount, onStackComplete]
  );

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const containers = Array.from(scroller.querySelectorAll('.scroll-stack-card-wrapper'));
    cardsRef.current = containers.map((el) => el.querySelector('.scroll-stack-card'));

    const refreshPositions = () => {
      cardOffsets.current = containers.map((el) =>
        useWindowScroll
          ? el.getBoundingClientRect().top + window.scrollY
          : el.offsetTop
      );
    };

    refreshPositions();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on('scroll', (e) => {
      updateCardTransforms(e.scroll);
    });

    window.addEventListener('resize', refreshPositions);
    const timer = setTimeout(refreshPositions, 500);

    return () => {
      window.removeEventListener('resize', refreshPositions);
      clearTimeout(timer);
      lenis.destroy();
    };
  }, [useWindowScroll, updateCardTransforms]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">{children}</div>
    </div>
  );
};

export default ScrollStack;