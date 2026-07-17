"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type { ObituaryMock } from "../../../lib/mockData";
import ObituaryCard from "../obituary/ObituaryCard";

type CarouselVariant = "default" | "memorable";
type ResponsiveCarouselProps = {
  items: ObituaryMock[];
  variant?: CarouselVariant;
};
type Breakpoint = "desktop" | "tablet" | "mobile";

const AUTO_DELAY = 3000;
const GAP = 16;

// ALL slides share ONE fixed height per breakpoint/variant.
// Center slide uses CSS scale(1.06) — no layout shift, no height jump.
function getTrackHeight(
  breakpoint: Breakpoint,
  variant: CarouselVariant,
): number {
  if (breakpoint === "mobile") return variant === "memorable" ? 620 : 580;
  if (variant === "memorable") return breakpoint === "desktop" ? 380 : 360;
  return breakpoint === "desktop" ? 580 : 500;
}

function getSlideWidth(
  breakpoint: Breakpoint,
  isCenter: boolean,
  variant: CarouselVariant,
): string {
  if (breakpoint === "desktop") {
    if (variant === "memorable") {
      return isCenter ? "42%" : "26%";
    }

    return isCenter ? "38%" : "29%";
  }

  if (breakpoint === "tablet") return "48%";
  return "100%";
}

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setBp("mobile");
        return;
      }
      if (w < 1024) {
        setBp("tablet");
        return;
      }
      setBp("desktop");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return bp;
}

function getVisibleCount(bp: Breakpoint): number {
  if (bp === "mobile") return 1;
  if (bp === "tablet") return 2;
  return 3;
}

export default function ResponsiveCarousel({
  items,
  variant = "default",
}: ResponsiveCarouselProps) {
  const breakpoint = useBreakpoint();
  const visibleCount = getVisibleCount(breakpoint);
  const isMobile = breakpoint === "mobile";
  const maxIndex = Math.max(0, items.length - visibleCount);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<number | null>(null);

  const next = useCallback(
    () => setCurrent((v) => (v >= maxIndex ? 0 : v + 1)),
    [maxIndex],
  );
  const prev = useCallback(
    () => setCurrent((v) => (v <= 0 ? maxIndex : v - 1)),
    [maxIndex],
  );

  const pauseTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    if (items.length <= visibleCount) return;
    timerRef.current = window.setInterval(next, AUTO_DELAY);
  }, [items.length, next, pauseTimer, visibleCount]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    setCurrent((v) => Math.min(v, maxIndex));
  }, [maxIndex]);

  const handlePrev = () => {
    prev();
    resetTimer();
  };
  const handleNext = () => {
    next();
    resetTimer();
  };

  // Single source of truth for height — used by wrapper AND every slide div
  const trackH = getTrackHeight(breakpoint, variant);
  const mobileOffset = current * (trackH + GAP);

  const trackStyle: CSSProperties = isMobile
    ? { transform: `translateY(-${mobileOffset}px)` }
    : {
        transform: `translateX(calc(-1 * ${current} * (${getSlideWidth(breakpoint, false, variant)} + ${GAP}px)))`,
      };

  return (
    <div
      className="select-none font-sans"
      onMouseEnter={pauseTimer}
      onMouseLeave={resetTimer}
      onFocus={pauseTimer}
      onBlur={resetTimer}
    >
      <div className="flex items-center gap-2 md:gap-3">
        {/* Left arrow */}
        {!isMobile && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300/70 text-xl text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            ‹
          </button>
        )}

        {/* HORIZONTAL — desktop / tablet
            Outer div: fixed height = trackH, overflow-hidden → container NEVER resizes */}
        {!isMobile && (
          <div className="flex-1 overflow-hidden" style={{ height: trackH }}>
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out will-change-transform"
              style={{ height: "100%", ...trackStyle }}
            >
              {items.map((item, index) => {
                const inView =
                  index >= current && index < current + visibleCount;
                const isCenter =
                  breakpoint === "desktop" && index === current + 1;
                const isFocal =
                  breakpoint === "desktop" ? isCenter : index === current;
                const width = getSlideWidth(breakpoint, isCenter, variant);

                return (
                  <div
                    key={item.id}
                    className="shrink-0 overflow-hidden rounded-[1.35rem] transition-all duration-500"
                    style={{
                      width,
                      // height = 100% of the fixed wrapper — never changes, no jump
                      height: "100%",
                      opacity: inView ? (isFocal ? 1 : 0.55) : 0.2,
                      transform:
                        breakpoint === "desktop" && variant === "memorable"
                          ? isFocal
                            ? "scale(1.08, 1.04)"
                            : "scale(0.95, 0.92)"
                          : "scale(1)",
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="h-full w-full">
                      <ObituaryCard
                        item={item}
                        variant={
                          variant === "memorable" ? "memorable" : "default"
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VERTICAL — mobile: fixed height clips to exactly one slide */}
        {isMobile && (
          <div
            className="flex-1 overflow-hidden rounded-[1.35rem]"
            style={{ height: trackH }}
          >
            <div
              className="flex flex-col transition-transform duration-500 ease-in-out will-change-transform"
              style={{ gap: GAP, ...trackStyle }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 overflow-hidden rounded-[1.35rem]"
                  style={{ height: trackH }}
                >
                  <ObituaryCard
                    item={item}
                    variant={variant === "memorable" ? "memorable" : "default"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right arrow */}
        {!isMobile && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300/70 text-xl text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
