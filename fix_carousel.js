const fs = require('fs');
const file = 'frontend/Component/public/obituary_detail/ObituaryDetailContainer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace state and timer
content = content.replace(
  `  const [current, setCurrent] = useState(0);\n  const timerRef = useRef<NodeJS.Timeout | null>(null);\n\n  const nextSlide = useCallback(() => {\n    setCurrent((prev) => (prev + 1) % slides.length);\n  }, [slides.length]);\n\n  const prevSlide = useCallback(() => {\n    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);\n  }, [slides.length]);\n\n  const pauseTimer = useCallback(() => {\n    if (timerRef.current) clearInterval(timerRef.current);\n    timerRef.current = null;\n  }, []);\n\n  const restartTimer = useCallback(() => {\n    pauseTimer();\n    if (slides.length <= 1) return;\n    timerRef.current = setInterval(nextSlide, AUTO_DELAY);\n  }, [nextSlide, pauseTimer, slides.length]);\n\n  useEffect(() => {\n    if (!slides.length) return;\n    restartTimer();\n    return () => { if (timerRef.current) clearInterval(timerRef.current); };\n  }, [slides.length, restartTimer]);`,
  `  const [current, setCurrent] = useState(0);\n\n  const nextSlide = useCallback(() => {\n    setCurrent((prev) => (prev + 1) % slides.length);\n  }, [slides.length]);\n\n  const prevSlide = useCallback(() => {\n    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);\n  }, [slides.length]);`
);

// Replace Desktop Slider opening and buttons
content = content.replace(
  `      {/* DESKTOP SLIDER */}\n      <div\n        className="relative mx-auto hidden w-full max-w-7xl overflow-hidden py-14 md:block"\n        onMouseEnter={pauseTimer}\n        onMouseLeave={restartTimer}\n        onFocus={pauseTimer}\n        onBlur={restartTimer}\n      >\n        <button type="button" onClick={() => { prevSlide(); restartTimer(); }}\n          className="absolute left-4 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-5xl text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-neutral-300">‹</button>\n        <button type="button" onClick={() => { nextSlide(); restartTimer(); }}\n          className="absolute right-4 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-5xl text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-neutral-300">›</button>`,
  `      {/* DESKTOP SLIDER */}\n      <div className="relative mx-auto hidden w-full max-w-7xl overflow-hidden py-14 md:block">\n        <button type="button" onClick={prevSlide}\n          className="absolute left-4 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-5xl text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-neutral-300">‹</button>\n        <button type="button" onClick={nextSlide}\n          className="absolute right-4 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-5xl text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-neutral-300">›</button>`
);

// Replace Mobile Slider opening and buttons
content = content.replace(
  `      {/* MOBILE SLIDER */}\n      <div\n        className="relative mx-auto block w-full overflow-hidden py-8 md:hidden"\n        onMouseEnter={pauseTimer}\n        onMouseLeave={restartTimer}\n        onFocus={pauseTimer}\n        onBlur={restartTimer}\n      >\n        <button type="button" onClick={() => { prevSlide(); restartTimer(); }}\n          className="absolute left-1/2 top-4 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700">‹</button>\n        <button type="button" onClick={() => { nextSlide(); restartTimer(); }}\n          className="absolute bottom-4 left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700">›</button>`,
  `      {/* MOBILE SLIDER */}\n      <div className="relative mx-auto block w-full overflow-hidden py-8 md:hidden">\n        <button type="button" onClick={prevSlide}\n          className="absolute left-1/2 top-4 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700">‹</button>\n        <button type="button" onClick={nextSlide}\n          className="absolute bottom-4 left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700">›</button>`
);

fs.writeFileSync(file, content);
console.log("File patched successfully!");
