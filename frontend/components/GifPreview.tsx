"use client";

import { useEffect, useMemo, useState } from "react";

type GifPreviewProps = {
  frames: string[];
  fps: number;
  whatsappFormat: boolean;
};

function formatForWhatsapp(asciiArt: string): string {
  if (!asciiArt) {
    return "";
  }
  return `\`\`\`\n${asciiArt}\n\`\`\``;
}

export function GifPreview({ frames, fps, whatsappFormat }: GifPreviewProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState<string>("");

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

  const currentFrameText = frames[frameIndex] ?? "";
  const outputText = whatsappFormat ? formatForWhatsapp(currentFrameText) : currentFrameText;

  async function handleCopy() {
    if (!outputText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setCopyStatus("Frame atual copiado para a area de transferencia.");
    } catch {
      setCopyStatus("Nao foi possivel copiar automaticamente.");
    }
  }

  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Preview GIF ASCII</h2>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!outputText}
          className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copiar frame para WhatsApp
        </button>
      </div>
      <div className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-[8px] leading-none text-slate-100 sm:text-[10px]">
        <pre>{outputText || "Os frames ASCII aparecerao aqui."}</pre>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Frame {frames.length ? frameIndex + 1 : 0} de {frames.length} | {fps} FPS
      </p>
      {copyStatus ? <p className="mt-1 text-sm text-slate-600">{copyStatus}</p> : null}
    </section>
  );
}
