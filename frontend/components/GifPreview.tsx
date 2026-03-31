"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FeedbackType = "success" | "error" | "info";

type GifPreviewProps = {
  frames: string[];
  fps: number;
  whatsappFormat: boolean;
  isDownloadingMedia: boolean;
  onDownloadGif: () => Promise<void>;
};

function formatForWhatsapp(asciiArt: string): string {
  if (!asciiArt) {
    return "";
  }
  return `\`\`\`\n${asciiArt}\n\`\`\``;
}

export function GifPreview({
  frames,
  fps,
  whatsappFormat,
  isDownloadingMedia,
  onDownloadGif
}: GifPreviewProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const previewPreRef = useRef<HTMLPreElement | null>(null);

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
      setFeedback({ type: "success", message: "Frame ASCII copiado para a area de transferencia." });
    } catch {
      setFeedback({ type: "error", message: "Nao foi possivel copiar automaticamente." });
    }
  }

  function handleDownloadCurrentFrame() {
    if (!outputText) {
      return;
    }

    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `ascii-gif-frame-${frameIndex + 1}.txt`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setFeedback({ type: "success", message: "Download do frame TXT iniciado." });
  }

  function handleDownloadAllFrames() {
    if (frames.length === 0) {
      return;
    }

    const serialized = frames
      .map((frame, idx) => {
        const content = whatsappFormat ? formatForWhatsapp(frame) : frame;
        return `=== Frame ${idx + 1} ===\n${content}`;
      })
      .join("\n\n");

    const blob = new Blob([serialized], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "ascii-gif-frames.txt";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setFeedback({ type: "success", message: "Download de todos os frames iniciado." });
  }

  async function handleDownloadGifClick() {
    if (frames.length === 0 || isDownloadingMedia) {
      return;
    }

    setFeedback({ type: "info", message: "Gerando GIF ASCII..." });
    try {
      await onDownloadGif();
      setFeedback({ type: "success", message: "Download do GIF iniciado." });
    } catch {
      setFeedback({ type: "error", message: "Nao foi possivel gerar o GIF." });
    }
  }

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const viewport = previewViewportRef.current;
    const pre = previewPreRef.current;

    if (!viewport || !pre || !outputText) {
      setPreviewScale(1);
      return;
    }

    const updateScale = () => {
      const availableWidth = viewport.clientWidth - 24;
      const availableHeight = viewport.clientHeight - 24;
      const contentWidth = pre.scrollWidth;
      const contentHeight = pre.scrollHeight;

      if (availableWidth <= 0 || availableHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) {
        setPreviewScale(1);
        return;
      }

      const nextScale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);
      setPreviewScale((current) => (Math.abs(current - nextScale) > 0.01 ? nextScale : current));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(viewport);
    resizeObserver.observe(pre);

    return () => {
      resizeObserver.disconnect();
    };
  }, [outputText, frameIndex]);

  const feedbackStyle =
    feedback?.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : feedback?.type === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-cyan-200 bg-cyan-50 text-cyan-700";

  const feedbackText = feedback?.message ?? (isDownloadingMedia ? "Gerando GIF ASCII..." : "");
  const shouldShowFeedback = Boolean(feedbackText);
  const isInfoFromExternalLoading = !feedback && isDownloadingMedia;
  const externalLoadingStyle = "border-cyan-200 bg-cyan-50 text-cyan-700";
  const finalFeedbackStyle = isInfoFromExternalLoading ? externalLoadingStyle : feedbackStyle;
  const feedbackAnimation = "animate-[fadeIn_180ms_ease-out]";
  const statusClassName = `mt-1 rounded-lg border px-3 py-2 text-sm font-medium ${finalFeedbackStyle} ${feedbackAnimation}`;

  const gifDownloadLabel = isDownloadingMedia ? "Gerando GIF..." : "Baixar GIF";

  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Preview GIF ASCII</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!outputText}
            className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copiar frame para WhatsApp
          </button>
          <button
            type="button"
            onClick={handleDownloadCurrentFrame}
            disabled={!outputText}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Baixar frame TXT
          </button>
          <button
            type="button"
            onClick={handleDownloadAllFrames}
            disabled={frames.length === 0}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Baixar todos os frames
          </button>
          <button
            type="button"
            onClick={handleDownloadGifClick}
            disabled={frames.length === 0 || isDownloadingMedia}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {gifDownloadLabel}
          </button>
        </div>
      </div>
      <div
        ref={previewViewportRef}
        className="relative h-[520px] overflow-hidden rounded-lg bg-slate-950 p-4 text-[8px] leading-none text-slate-100 sm:text-[10px]"
      >
        <div className="absolute inset-4 flex items-center justify-center overflow-hidden">
          <pre
            ref={previewPreRef}
            className="origin-center whitespace-pre"
            style={{ transform: `scale(${previewScale})` }}
          >
            {outputText || "Os frames ASCII aparecerao aqui."}
          </pre>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Frame {frames.length ? frameIndex + 1 : 0} de {frames.length} | {fps} FPS
      </p>
      {shouldShowFeedback ? <p className={statusClassName}>{feedbackText}</p> : null}
    </section>
  );
}
