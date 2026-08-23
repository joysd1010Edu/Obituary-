"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ImageSliderProps = {
  images: string[];
};

export default function ImageSlider({ images }: ImageSliderProps) {
  const validImages = (images || []).filter(Boolean);
  const total = validImages.length;
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation when user presses left or right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Reset index if image array changes
  useEffect(() => {
    setCurrent(0);
  }, [images]);

  if (total === 0) {
    return (
      <div className="relative mx-auto h-[360px] w-full max-w-[420px] overflow-hidden rounded-[30px] shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
        <Image
          src="/Source/Placeholder_Person.png"
          alt="Memorial photo"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 90vw, 420px"
        />
      </div>
    );
  }

  // If only 1 image: Render a single centered elegant card without slider controls
  if (total === 1) {
    return (
      <div className="relative mx-auto flex justify-center py-6">
        <div className="relative h-[380px] sm:h-[460px] md:h-[520px] w-full max-w-[420px] overflow-hidden rounded-[32px] shadow-[0_16px_40px_rgba(15,23,42,0.14)] ring-1 ring-black/5">
          <Image
            src={validImages[0]}
            alt="Memorial photo"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 420px"
          />
        </div>
      </div>
    );
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrev();
    }
    setTouchStart(null);
  };

  // For 2 images or 3+ images, calculate left, center, right slides
  const prevIndex = (current - 1 + total) % total;
  const nextIndex = (current + 1) % total;

  return (
    <div
      className="relative mx-auto w-full max-w-6xl select-none py-6 sm:py-10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* DESKTOP 3D PERSPECTIVE CAROUSEL */}
      <div className="relative hidden md:flex items-center justify-center h-[520px] overflow-hidden">
        {/* Previous Button */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous slide"
          className="absolute left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:text-slate-900 active:scale-95"
        >
          <ChevronLeft className="h-7 w-7 stroke-[2.5]" />
        </button>

        {/* Slides Track */}
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Left Slide (Previous) */}
          {total >= 3 && (
            <button
              type="button"
              onClick={goToPrev}
              aria-label="View previous image"
              className="absolute left-[8%] z-20 h-[400px] w-[300px] cursor-pointer overflow-hidden rounded-[28px] opacity-60 shadow-lg transition-all duration-500 hover:opacity-85 hover:scale-[0.96]"
            >
              <Image
                src={validImages[prevIndex]}
                alt={`Photo ${prevIndex + 1}`}
                fill
                className="object-cover"
                sizes="300px"
              />
              <div className="absolute inset-0 bg-black/20" />
            </button>
          )}

          {/* Active Center Slide */}
          <div className="relative z-30 h-[480px] w-[380px] overflow-hidden rounded-[32px] shadow-[0_20px_50px_rgba(15,23,42,0.22)] ring-1 ring-black/10 transition-all duration-500">
            <Image
              src={validImages[current]}
              alt={`Photo ${current + 1}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 380px, 420px"
            />
          </div>

          {/* Right Slide (Next) */}
          {total >= 2 && (
            <button
              type="button"
              onClick={goToNext}
              aria-label="View next image"
              className={`absolute ${total >= 3 ? "right-[8%]" : "right-[15%]"} z-20 h-[400px] w-[300px] cursor-pointer overflow-hidden rounded-[28px] opacity-60 shadow-lg transition-all duration-500 hover:opacity-85 hover:scale-[0.96]`}
            >
              <Image
                src={validImages[nextIndex]}
                alt={`Photo ${nextIndex + 1}`}
                fill
                className="object-cover"
                sizes="300px"
              />
              <div className="absolute inset-0 bg-black/20" />
            </button>
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:text-slate-900 active:scale-95"
        >
          <ChevronRight className="h-7 w-7 stroke-[2.5]" />
        </button>
      </div>

      {/* MOBILE SLIDER */}
      <div className="relative block md:hidden">
        <div className="relative mx-auto h-[380px] sm:h-[440px] w-[90%] max-w-[360px] overflow-hidden rounded-[26px] shadow-[0_12px_32px_rgba(15,23,42,0.15)] ring-1 ring-black/10">
          <Image
            src={validImages[current]}
            alt={`Memorial photo ${current + 1}`}
            fill
            priority
            className="object-cover transition-all duration-500"
            sizes="90vw"
          />

          {/* Floating Mobile Controls */}
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white shadow backdrop-blur-sm active:scale-90"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white shadow backdrop-blur-sm active:scale-90"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* MANUAL NAVIGATION INDICATOR / CONTROLS (Dots & Counter) */}
      <div className="mt-5 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          {validImages.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-8 bg-[#274877]"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-slate-500">
          {current + 1} / {total}
        </span>
      </div>
    </div>
  );
}
