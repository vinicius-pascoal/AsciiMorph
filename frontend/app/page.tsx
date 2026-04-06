"use client";

import { useEffect, useMemo, useState } from "react";

import { AsciiPreview } from "../components/AsciiPreview";
import { ControlsPanel, CustomStylePreset } from "../components/ControlsPanel";
import { GifPreview } from "../components/GifPreview";
import { UploadForm } from "../components/UploadForm";
import { convertToAscii, downloadAsciiGif, downloadAsciiPng, GifResult, ImageResult } from "../lib/api";

type Mode = "image" | "gif";
const CUSTOM_PRESETS_STORAGE_KEY = "ascii-morph-custom-style-presets";

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(120);
  const [charset, setCharset] = useState("@%#*+=-:. ");
  const [invert, setInvert] = useState(false);
  const [autoQuality, setAutoQuality] = useState(false);
  const [mosaicMode, setMosaicMode] = useState(false);
  const [mosaicBlocksX, setMosaicBlocksX] = useState(3);
  const [mosaicBlocksY, setMosaicBlocksY] = useState(3);
  const [mosaicCharsets, setMosaicCharsets] = useState("@%#*+=-:. | @#*:. | #@O=+|:. ");
  const [duotoneMode, setDuotoneMode] = useState(false);
  const [duotoneThreshold, setDuotoneThreshold] = useState(128);
  const [duotoneDarkCharset, setDuotoneDarkCharset] = useState("@#%WM8B$");
  const [duotoneLightCharset, setDuotoneLightCharset] = useState("+=-:. ");
  const [layersMode, setLayersMode] = useState(false);
  const [layersBackgroundCharset, setLayersBackgroundCharset] = useState(" .:-=");
  const [layersSubjectCharset, setLayersSubjectCharset] = useState("@#%WM8B$");
  const [layersTextCharset, setLayersTextCharset] = useState("/\\|()[]{}");
  const [layersTextEdgeThreshold, setLayersTextEdgeThreshold] = useState(40);
  const [layersSubjectDeltaThreshold, setLayersSubjectDeltaThreshold] = useState(24);
  const [typographyMode, setTypographyMode] = useState(false);
  const [typographyLetters, setTypographyLetters] = useState("VINI");
  const [whatsappFormat, setWhatsappFormat] = useState(true);
  const [loading, setLoading] = useState(false);
  const [downloadingMedia, setDownloadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asciiArt, setAsciiArt] = useState("");
  const [gifFrames, setGifFrames] = useState<string[]>([]);
  const [gifFps, setGifFps] = useState(10);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<CustomStylePreset[]>([]);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
      if (!rawValue) {
        return;
      }

      const parsedValue = JSON.parse(rawValue) as CustomStylePreset[];
      if (!Array.isArray(parsedValue)) {
        return;
      }

      const sanitizedPresets = parsedValue.filter((preset) => {
        return (
          typeof preset?.id === "string" &&
          typeof preset?.name === "string" &&
          typeof preset?.charset === "string" &&
          typeof preset?.invert === "boolean" &&
          typeof preset?.whatsappFormat === "boolean"
        );
      });

      setCustomPresets(sanitizedPresets);
    } catch {
      setCustomPresets([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    if (mode !== "image" || !file) {
      setOriginalImageUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setOriginalImageUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file, mode]);

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
        autoQuality,
        mosaicMode,
        mosaicBlocksX,
        mosaicBlocksY,
        mosaicCharsets,
        duotoneMode,
        duotoneThreshold,
        duotoneDarkCharset,
        duotoneLightCharset,
        layersMode,
        layersBackgroundCharset,
        layersSubjectCharset,
        layersTextCharset,
        layersTextEdgeThreshold,
        layersSubjectDeltaThreshold,
        typographyMode,
        typographyLetters,
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
          invert,
          autoQuality,
          mosaicMode,
          mosaicBlocksX,
          mosaicBlocksY,
          mosaicCharsets,
          duotoneMode,
          duotoneThreshold,
          duotoneDarkCharset,
          duotoneLightCharset,
          layersMode,
          layersBackgroundCharset,
          layersSubjectCharset,
          layersTextCharset,
          layersTextEdgeThreshold,
          layersSubjectDeltaThreshold,
          typographyMode,
          typographyLetters
        });
        triggerBlobDownload(blob, "ascii-image.png");
      } else {
        const blob = await downloadAsciiGif({
          file,
          width,
          charset,
          invert,
          autoQuality,
          mosaicMode,
          mosaicBlocksX,
          mosaicBlocksY,
          mosaicCharsets,
          duotoneMode,
          duotoneThreshold,
          duotoneDarkCharset,
          duotoneLightCharset,
          layersMode,
          layersBackgroundCharset,
          layersSubjectCharset,
          layersTextCharset,
          layersTextEdgeThreshold,
          layersSubjectDeltaThreshold,
          typographyMode,
          typographyLetters
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

  function handleSaveCustomPreset(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const nextPreset: CustomStylePreset = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: trimmedName,
      charset,
      invert,
      whatsappFormat
    };

    setCustomPresets((currentPresets) => {
      const withoutSameName = currentPresets.filter((preset) => {
        return preset.name.toLowerCase() !== trimmedName.toLowerCase();
      });
      return [nextPreset, ...withoutSameName].slice(0, 10);
    });
  }

  function handleDeleteCustomPreset(id: string) {
    setCustomPresets((currentPresets) => currentPresets.filter((preset) => preset.id !== id));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl bg-ink px-6 py-8 text-white shadow-card sm:px-10">
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Imagem e GIF para ASCII</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">{heroSubtitle}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-2 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <ControlsPanel
            mode={mode}
            width={width}
            charset={charset}
            invert={invert}
            autoQuality={autoQuality}
            mosaicMode={mosaicMode}
            mosaicBlocksX={mosaicBlocksX}
            mosaicBlocksY={mosaicBlocksY}
            mosaicCharsets={mosaicCharsets}
            duotoneMode={duotoneMode}
            duotoneThreshold={duotoneThreshold}
            duotoneDarkCharset={duotoneDarkCharset}
            duotoneLightCharset={duotoneLightCharset}
            layersMode={layersMode}
            layersBackgroundCharset={layersBackgroundCharset}
            layersSubjectCharset={layersSubjectCharset}
            layersTextCharset={layersTextCharset}
            layersTextEdgeThreshold={layersTextEdgeThreshold}
            layersSubjectDeltaThreshold={layersSubjectDeltaThreshold}
            typographyMode={typographyMode}
            typographyLetters={typographyLetters}
            whatsappFormat={whatsappFormat}
            customPresets={customPresets}
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
            onAutoQualityChange={setAutoQuality}
            onMosaicModeChange={(value) => {
              setMosaicMode(value);
              if (value) {
                setDuotoneMode(false);
                setLayersMode(false);
              }
            }}
            onMosaicBlocksXChange={setMosaicBlocksX}
            onMosaicBlocksYChange={setMosaicBlocksY}
            onMosaicCharsetsChange={setMosaicCharsets}
            onDuotoneModeChange={(value) => {
              setDuotoneMode(value);
              if (value) {
                setMosaicMode(false);
                setLayersMode(false);
              }
            }}
            onDuotoneThresholdChange={setDuotoneThreshold}
            onDuotoneDarkCharsetChange={setDuotoneDarkCharset}
            onDuotoneLightCharsetChange={setDuotoneLightCharset}
            onLayersModeChange={(value) => {
              setLayersMode(value);
              if (value) {
                setMosaicMode(false);
                setDuotoneMode(false);
              }
            }}
            onLayersBackgroundCharsetChange={setLayersBackgroundCharset}
            onLayersSubjectCharsetChange={setLayersSubjectCharset}
            onLayersTextCharsetChange={setLayersTextCharset}
            onLayersTextEdgeThresholdChange={setLayersTextEdgeThreshold}
            onLayersSubjectDeltaThresholdChange={setLayersSubjectDeltaThreshold}
            onTypographyModeChange={setTypographyMode}
            onTypographyLettersChange={setTypographyLetters}
            onWhatsappFormatChange={setWhatsappFormat}
            onSaveCustomPreset={handleSaveCustomPreset}
            onDeleteCustomPreset={handleDeleteCustomPreset}
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
              originalImageUrl={originalImageUrl}
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
