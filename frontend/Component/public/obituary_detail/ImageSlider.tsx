"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const AUTO_DELAY = 3200;
const GAP = 18;
const VISIBLE_SLIDES = 3;

type ImageSliderProps = {
  images: string[];
};

function buildSlides(images: string[]): string[] {
  if (images.length === 0) {
    return [];
  }

  if (images.length >= VISIBLE_SLIDES) {
    return images;
  }

  const slides = [...images];
  while (slides.length < VISIBLE_SLIDES) {
    slides.push(images[slides.length % images.length]);
  }

  return slides;
}

function getBreakpoint(): "mobile" | "desktop" {
  if (typeof window === "undefined") {
    return "desktop";
  }

  return window.innerWidth < 768 ? "mobile" : "desktop";
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const slides = useMemo(() => buildSlides(images), [images]);
  const [current, setCurrent] = useState(0);
  const [breakpoint, setBreakpoint] = useState<"mobile" | "desktop">("desktop");
  const timerRef = useRef<number | null>(null);
  const isMobile = breakpoint === "mobile";

  const goToNext = useCallback(() => {
    setCurrent((value) =>
      slides.length === 0 ? 0 : (value + 1) % slides.length,
    );
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrent((value) =>
      slides.length === 0 ? 0 : (value - 1 + slides.length) % slides.length,
    );
  }, [slides.length]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
    timerRef.current = null;
  }, []);

  const restartTimer = useCallback(() => {
    pauseTimer();
    if (slides.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setCurrent((value) =>
        slides.length === 0 ? 0 : (value + 1) % slides.length,
      );
    }, AUTO_DELAY);
  }, [pauseTimer, slides.length]);

  useEffect(() => {
    setBreakpoint(getBreakpoint());

    const handleResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener("resize", handleResize);

    if (slides.length === 0) {
      return () => window.removeEventListener("resize", handleResize);
    }

    restartTimer();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [restartTimer, slides.length]);

  useEffect(() => {
    setCurrent((value) => (slides.length === 0 ? 0 : value % slides.length));
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const visibleIndexes = isMobile
    ? [current]
    : [current - 1, current, current + 1].map(
        (index) => (index + slides.length) % slides.length,
      );

  const handlePrevious = () => {
    goToPrev();
    restartTimer();
  };

  const handleNext = () => {
    goToNext();
    restartTimer();
  };

  const slideStyle = (position: "left" | "center" | "right"): CSSProperties => {
    if (isMobile) {
      return {
        left: "50%",
        width: "100%",
        transform: "translate(-50%, -50%) scale(1)",
        zIndex: 10,
      };
    }

    if (position === "center") {
      return {
        left: "50%",
        width: "54%",
        transform: "translate(-50%, -50%) scale(1.08)",
        zIndex: 30,
      };
    }

    return position === "left"
      ? {
          left: "10%",
          width: "38%",
          transform: "translateY(-43%) scale(0.94)",
          zIndex: 20,
          opacity: 0.78,
        }
      : {
          left: "90%",
          width: "38%",
          transform: "translate(-100%, -43%) scale(0.94)",
          zIndex: 20,
          opacity: 0.78,
        };
  };

  const sliderHeight = isMobile ? 380 : 560;

  return (
    <div
      className="select-none"
      onMouseEnter={pauseTimer}
      onMouseLeave={restartTimer}
      onFocus={pauseTimer}
      onBlur={restartTimer}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous slide"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700 transition hover:bg-neutral-300 sm:h-12 sm:w-12"
        >
          ‹
        </button>

        <div
          className="relative flex-1 overflow-hidden"
          style={{ height: sliderHeight }}
        >
          {visibleIndexes.map((index, position) => {
            const slidePosition = isMobile
              ? "center"
              : position === 1
                ? "center"
                : position === 0
                  ? "left"
                  : "right";

            return (
              <button
                key={`${slides[index]}-${index}`}
                type="button"
                onClick={() => {
                  setCurrent(index);
                  restartTimer();
                }}
                className="absolute top-1/2 block aspect-[4/3] overflow-hidden rounded-[1.85rem] border-0 bg-transparent p-0 outline-none transition-transform duration-500 ease-in-out"
                style={slideStyle(slidePosition)}
                aria-label={`Go to slide ${index + 1}`}
              >
                <Image
                  src={slides[index]}
                  alt={`Memorial image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 54vw"
                  className="object-cover"
                  priority={index === current}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700 transition hover:bg-neutral-300 sm:h-12 sm:w-12"
        >
          ›
        </button>
      </div>
    </div>
  );
}
