"use client";

import { useEffect, useMemo, useState } from "react";

type FeedbackType = "success" | "error" | "info";

type AsciiPreviewProps = {
  asciiArt: string;
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
  whatsappFormat,
  isDownloadingMedia,
  onDownloadPng
}: AsciiPreviewProps) {
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);

  const outputText = useMemo(() => {
    if (!whatsappFormat) {
      return asciiArt;
    }
    return formatForWhatsapp(asciiArt);
  }, [asciiArt, whatsappFormat]);

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
      <div className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-[8px] leading-none text-slate-100 sm:text-[10px]">
        <pre>{preText}</pre>
      </div>
      {showStatus ? <p className={statusClassName}>{statusMessage}</p> : null}
    </section>
  );
}
