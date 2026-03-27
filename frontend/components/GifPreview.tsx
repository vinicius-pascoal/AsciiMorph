"use client";

import { useEffect, useMemo, useState } from "react";

type GifPreviewProps = {
  frames: string[];
  fps: number;
};

export function GifPreview({ frames, fps }: GifPreviewProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  const intervalMs = useMemo(() => {
    if (fps <= 0) {
      return 100;
    }
    return Math.max(16, Math.floor(1000 / fps));
  }, [fps]);

  useEffect(() => {
    if (frames.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [frames, intervalMs]);

  useEffect(() => {
    setFrameIndex(0);
  }, [frames]);

  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold">Preview GIF ASCII</h2>
      <div className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-[8px] leading-none text-slate-100 sm:text-[10px]">
        <pre>{frames[frameIndex] ?? "Os frames ASCII aparecerão aqui."}</pre>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Frame {frames.length ? frameIndex + 1 : 0} de {frames.length} | {fps} FPS
      </p>
    </section>
  );
}
