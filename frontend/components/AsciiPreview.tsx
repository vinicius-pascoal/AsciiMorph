"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type FeedbackType = "success" | "error" | "info";

type AsciiPreviewProps = {
  asciiArt: string;
  originalImageUrl: string | null;
  whatsappFormat: boolean;
  isDownloadingMedia: boolean;
  onDownloadPng: () => Promise<void>;
};

function formatForWhatsapp(asciiArt: string): string {
  if (!asciiArt) {
    return "";
  }
  return `\`\`\`\n${asciiArt}\n\`\`\``;
}

export function AsciiPreview({
  asciiArt,
  originalImageUrl,
  whatsappFormat,
  isDownloadingMedia,
  onDownloadPng
}: AsciiPreviewProps) {
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [overlayScale, setOverlayScale] = useState(1);
  const comparisonViewportRef = useRef<HTMLDivElement | null>(null);
  const overlayViewportRef = useRef<HTMLDivElement | null>(null);
  const overlayPreRef = useRef<HTMLPreElement | null>(null);

  const outputText = useMemo(() => {
    if (!whatsappFormat) {
      return asciiArt;
    }
    return formatForWhatsapp(asciiArt);
  }, [asciiArt, whatsappFormat]);

  const showComparison = Boolean(originalImageUrl) && Boolean(asciiArt);

  function updateSplitFromClientX(clientX: number) {
    const viewport = comparisonViewportRef.current;
    if (!viewport) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    if (!bounds.width) {
      return;
    }

    const nextRatio = ((clientX - bounds.left) / bounds.width) * 100;
    const clampedRatio = Math.max(0, Math.min(100, nextRatio));
    setSplitRatio(Math.round(clampedRatio));
  }

  function handleComparisonPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingSplit(true);
    updateSplitFromClientX(event.clientX);
  }

  function handleComparisonPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDraggingSplit) {
      return;
    }

    updateSplitFromClientX(event.clientX);
  }

  function handleComparisonPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDraggingSplit(false);
  }

  async function handleCopy() {
    if (!outputText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setFeedback({ type: "success", message: "ASCII copiado para a area de transferencia." });
    } catch {
      setFeedback({ type: "error", message: "Nao foi possivel copiar automaticamente." });
    }
  }

  function handleDownload() {
    if (!outputText) {
      return;
    }

    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "ascii-image.txt";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setFeedback({ type: "success", message: "Download do TXT iniciado." });
  }

  async function handleDownloadPngClick() {
    if (!asciiArt || isDownloadingMedia) {
      return;
    }

    setFeedback({ type: "info", message: "Gerando PNG ASCII..." });
    try {
      await onDownloadPng();
      setFeedback({ type: "success", message: "Download do PNG iniciado." });
    } catch {
      setFeedback({ type: "error", message: "Nao foi possivel gerar o PNG." });
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
    if (!showComparison) {
      return;
    }

    const viewport = overlayViewportRef.current;
    const pre = overlayPreRef.current;
    if (!viewport || !pre) {
      return;
    }

    const calculateScale = () => {
      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;
      const contentWidth = pre.scrollWidth;
      const contentHeight = pre.scrollHeight;

      if (!viewportWidth || !viewportHeight || !contentWidth || !contentHeight) {
        setOverlayScale(1);
        return;
      }

      const fitWidth = viewportWidth / contentWidth;
      const fitHeight = viewportHeight / contentHeight;
      const nextScale = Math.min(fitWidth, fitHeight, 1);
      setOverlayScale(nextScale);
    };

    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [asciiArt, showComparison, splitRatio]);

  const feedbackStyle =
    feedback?.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : feedback?.type === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-cyan-200 bg-cyan-50 text-cyan-700";

  const feedbackText = feedback?.message ?? (isDownloadingMedia ? "Gerando PNG ASCII..." : "");

  const shouldShowFeedback = Boolean(feedbackText);

  const isInfoFromExternalLoading = !feedback && isDownloadingMedia;

  const externalLoadingStyle = "border-cyan-200 bg-cyan-50 text-cyan-700";

  const finalFeedbackStyle = isInfoFromExternalLoading ? externalLoadingStyle : feedbackStyle;

  const feedbackAnimation = "animate-[fadeIn_180ms_ease-out]";

  const feedbackClassName = `mt-3 rounded-lg border px-3 py-2 text-sm font-medium ${finalFeedbackStyle} ${feedbackAnimation}`;

  const showFeedback = shouldShowFeedback;

  const downloadPngLabel = isDownloadingMedia ? "Gerando PNG..." : "Baixar PNG";

  const canDownloadPng = Boolean(asciiArt) && !isDownloadingMedia;

  const canCopyOrDownloadText = Boolean(outputText);

  const panelText = outputText || "O resultado ASCII aparecera aqui.";

  const showStatus = showFeedback;

  const statusMessage = feedbackText;

  const statusClassName = feedbackClassName;

  const copyDisabled = !canCopyOrDownloadText;

  const txtDisabled = !canCopyOrDownloadText;

  const pngDisabled = !canDownloadPng;

  const preText = panelText;

  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Preview ASCII</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={copyDisabled}
            className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copiar para WhatsApp
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={txtDisabled}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Baixar TXT
          </button>
          <button
            type="button"
            onClick={handleDownloadPngClick}
            disabled={pngDisabled}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadPngLabel}
          </button>
        </div>
      </div>
      {showComparison ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Comparacao com divisor</h3>
            <span className="text-xs text-slate-500">Arraste na imagem para mover o divisor</span>
          </div>

          <div
            ref={comparisonViewportRef}
            className={`relative h-72 touch-none select-none overflow-hidden rounded-md border border-slate-200 bg-slate-100 sm:h-80 ${isDraggingSplit ? "cursor-ew-resize" : "cursor-col-resize"}`}
            onPointerDown={handleComparisonPointerDown}
            onPointerMove={handleComparisonPointerMove}
            onPointerUp={handleComparisonPointerUp}
            onPointerCancel={handleComparisonPointerUp}
          >
            <div className="absolute inset-0">
              <Image
                src={originalImageUrl ?? ""}
                alt="Imagem original selecionada"
                width={1200}
                height={800}
                unoptimized
                className="h-full w-full object-contain"
              />
            </div>

            <div className="absolute inset-0 overflow-hidden bg-slate-950/95" style={{ clipPath: `inset(0 ${100 - splitRatio}% 0 0)` }}>
              <div ref={overlayViewportRef} className="flex h-full w-full items-center justify-center overflow-hidden p-2 text-[8px] leading-none text-slate-100 sm:text-[10px]">
                <pre
                  ref={overlayPreRef}
                  className="origin-center"
                  style={{ transform: `scale(${overlayScale})` }}
                >
                  {asciiArt}
                </pre>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-accent shadow-[0_0_0_1px_rgba(14,116,144,0.35)]"
              style={{ left: `${splitRatio}%` }}
            />
            <div
              className="pointer-events-none absolute top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-canvas/95 shadow-[0_2px_8px_rgba(15,23,42,0.16)]"
              style={{ left: `${splitRatio}%` }}
            />
          </div>
        </div>
      ) : null}
      {!showComparison ? (
        <div className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-[8px] leading-none text-slate-100 sm:text-[10px]">
          <pre>{preText}</pre>
        </div>
      ) : null}
      {showStatus ? <p className={statusClassName}>{statusMessage}</p> : null}
    </section>
  );
}
