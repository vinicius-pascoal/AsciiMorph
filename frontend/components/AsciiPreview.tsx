"use client";

import { useMemo, useState } from "react";

type AsciiPreviewProps = {
  asciiArt: string;
  whatsappFormat: boolean;
  isDownloadingMedia: boolean;
  onDownloadPng: () => void;
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
  const [copyStatus, setCopyStatus] = useState<string>("");

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
      setCopyStatus("Copiado para a area de transferencia.");
    } catch {
      setCopyStatus("Nao foi possivel copiar automaticamente.");
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
  }

  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Preview ASCII</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!outputText}
            className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copiar para WhatsApp
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!outputText}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Baixar TXT
          </button>
          <button
            type="button"
            onClick={onDownloadPng}
            disabled={!asciiArt || isDownloadingMedia}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownloadingMedia ? "Gerando PNG..." : "Baixar PNG"}
          </button>
        </div>
      </div>
      <div className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-[8px] leading-none text-slate-100 sm:text-[10px]">
        <pre>{outputText || "O resultado ASCII aparecera aqui."}</pre>
      </div>
      {copyStatus ? <p className="mt-3 text-sm text-slate-600">{copyStatus}</p> : null}
    </section>
  );
}
