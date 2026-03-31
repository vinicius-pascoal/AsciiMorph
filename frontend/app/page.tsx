"use client";

import { useMemo, useState } from "react";

import { AsciiPreview } from "../components/AsciiPreview";
import { ControlsPanel } from "../components/ControlsPanel";
import { GifPreview } from "../components/GifPreview";
import { UploadForm } from "../components/UploadForm";
import { convertToAscii, downloadAsciiGif, downloadAsciiPng, GifResult, ImageResult } from "../lib/api";

type Mode = "image" | "gif";

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(120);
  const [charset, setCharset] = useState("@%#*+=-:. ");
  const [invert, setInvert] = useState(false);
  const [whatsappFormat, setWhatsappFormat] = useState(true);
  const [loading, setLoading] = useState(false);
  const [downloadingMedia, setDownloadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asciiArt, setAsciiArt] = useState("");
  const [gifFrames, setGifFrames] = useState<string[]>([]);
  const [gifFps, setGifFps] = useState(10);

  const heroSubtitle = useMemo(() => {
    if (mode === "gif") {
      return "Converta GIFs em animações ASCII frame a frame";
    }
    return "Converta imagens estáticas em arte ASCII em segundos";
  }, [mode]);

  async function handleConvert() {
    if (!file) {
      setError("Selecione um arquivo antes de converter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await convertToAscii({
        file,
        width,
        charset,
        invert,
        mode
      });

      if (mode === "image") {
        const typedResult = result as ImageResult;
        setAsciiArt(typedResult.ascii_art);
        setGifFrames([]);
      } else {
        const typedResult = result as GifResult;
        setGifFrames(typedResult.frames.map((frame) => frame.ascii_art));
        setGifFps(typedResult.fps);
        setAsciiArt(typedResult.frames[0]?.ascii_art ?? "");
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Erro inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function triggerBlobDownload(blob: Blob, fileName: string) {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  async function handleDownloadMedia() {
    if (!file) {
      const message = "Selecione e converta um arquivo antes de baixar.";
      setError(message);
      throw new Error(message);
    }

    setDownloadingMedia(true);
    setError(null);

    try {
      if (mode === "image") {
        const blob = await downloadAsciiPng({
          file,
          width,
          charset,
          invert
        });
        triggerBlobDownload(blob, "ascii-image.png");
      } else {
        const blob = await downloadAsciiGif({
          file,
          width,
          charset,
          invert
        });
        triggerBlobDownload(blob, "ascii-animation.gif");
      }
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : "Erro ao baixar arquivo.";
      setError(message);
      throw downloadError;
    } finally {
      setDownloadingMedia(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl bg-ink px-6 py-8 text-white shadow-card sm:px-10">
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Imagem e GIF para ASCII</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">{heroSubtitle}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <ControlsPanel
            mode={mode}
            width={width}
            charset={charset}
            invert={invert}
            whatsappFormat={whatsappFormat}
            onModeChange={(nextMode) => {
              setMode(nextMode);
              setFile(null);
              setError(null);
              setAsciiArt("");
              setGifFrames([]);
            }}
            onWidthChange={setWidth}
            onCharsetChange={setCharset}
            onInvertChange={setInvert}
            onWhatsappFormatChange={setWhatsappFormat}
          />

          <UploadForm mode={mode} file={file} isLoading={loading} onFileChange={setFile} onSubmit={handleConvert} />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          {mode === "gif" ? (
            <GifPreview
              frames={gifFrames}
              fps={gifFps}
              whatsappFormat={whatsappFormat}
              isDownloadingMedia={downloadingMedia}
              onDownloadGif={handleDownloadMedia}
            />
          ) : (
            <AsciiPreview
              asciiArt={asciiArt}
              whatsappFormat={whatsappFormat}
              isDownloadingMedia={downloadingMedia}
              onDownloadPng={handleDownloadMedia}
            />
          )}
        </div>
      </div>
    </main>
  );
}
