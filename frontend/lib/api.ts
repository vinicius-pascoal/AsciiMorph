export type ConvertMode = "image" | "gif";

export type ConvertParams = {
  file: File;
  width: number;
  charset: string;
  invert: boolean;
  autoQuality: boolean;
  mosaicMode: boolean;
  mosaicBlocksX: number;
  mosaicBlocksY: number;
  mosaicCharsets: string;
  duotoneMode: boolean;
  duotoneThreshold: number;
  duotoneDarkCharset: string;
  duotoneLightCharset: string;
  layersMode: boolean;
  layersBackgroundCharset: string;
  layersSubjectCharset: string;
  layersTextCharset: string;
  layersTextEdgeThreshold: number;
  layersSubjectDeltaThreshold: number;
  mode: ConvertMode;
};

export type ImageResult = {
  ascii_art: string;
  width: number;
  height: number;
};

export type GifFrame = {
  index: number;
  ascii_art: string;
};

export type GifResult = {
  frames: GifFrame[];
  frame_count: number;
  fps: number;
  width: number;
  height: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const DOWNLOAD_TIMEOUT_MS = 120000;

type DownloadParams = {
  file: File;
  width: number;
  charset: string;
  invert: boolean;
  autoQuality: boolean;
  mosaicMode: boolean;
  mosaicBlocksX: number;
  mosaicBlocksY: number;
  mosaicCharsets: string;
  duotoneMode: boolean;
  duotoneThreshold: number;
  duotoneDarkCharset: string;
  duotoneLightCharset: string;
  layersMode: boolean;
  layersBackgroundCharset: string;
  layersSubjectCharset: string;
  layersTextCharset: string;
  layersTextEdgeThreshold: number;
  layersSubjectDeltaThreshold: number;
};

export async function convertToAscii(params: ConvertParams): Promise<ImageResult | GifResult> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("width", String(params.width));
  formData.append("charset", params.charset);
  formData.append("invert", String(params.invert));
  formData.append("auto_quality", String(params.autoQuality));
  formData.append("mosaic_mode", String(params.mosaicMode));
  formData.append("mosaic_blocks_x", String(params.mosaicBlocksX));
  formData.append("mosaic_blocks_y", String(params.mosaicBlocksY));
  formData.append("mosaic_charsets", params.mosaicCharsets);
  formData.append("duotone_mode", String(params.duotoneMode));
  formData.append("duotone_threshold", String(params.duotoneThreshold));
  formData.append("duotone_dark_charset", params.duotoneDarkCharset);
  formData.append("duotone_light_charset", params.duotoneLightCharset);
  formData.append("layers_mode", String(params.layersMode));
  formData.append("layers_background_charset", params.layersBackgroundCharset);
  formData.append("layers_subject_charset", params.layersSubjectCharset);
  formData.append("layers_text_charset", params.layersTextCharset);
  formData.append("layers_text_edge_threshold", String(params.layersTextEdgeThreshold));
  formData.append("layers_subject_delta_threshold", String(params.layersSubjectDeltaThreshold));

  const endpoint = params.mode === "gif" ? "/convert/gif" : "/convert/image";
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "Falha ao converter para ASCII.");
  }

  return response.json();
}

function buildConvertFormData(params: DownloadParams): FormData {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("width", String(params.width));
  formData.append("charset", params.charset);
  formData.append("invert", String(params.invert));
  formData.append("auto_quality", String(params.autoQuality));
  formData.append("mosaic_mode", String(params.mosaicMode));
  formData.append("mosaic_blocks_x", String(params.mosaicBlocksX));
  formData.append("mosaic_blocks_y", String(params.mosaicBlocksY));
  formData.append("mosaic_charsets", params.mosaicCharsets);
  formData.append("duotone_mode", String(params.duotoneMode));
  formData.append("duotone_threshold", String(params.duotoneThreshold));
  formData.append("duotone_dark_charset", params.duotoneDarkCharset);
  formData.append("duotone_light_charset", params.duotoneLightCharset);
  formData.append("layers_mode", String(params.layersMode));
  formData.append("layers_background_charset", params.layersBackgroundCharset);
  formData.append("layers_subject_charset", params.layersSubjectCharset);
  formData.append("layers_text_charset", params.layersTextCharset);
  formData.append("layers_text_edge_threshold", String(params.layersTextEdgeThreshold));
  formData.append("layers_subject_delta_threshold", String(params.layersSubjectDeltaThreshold));
  return formData;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Tempo limite excedido ao gerar arquivo. Tente reduzir a largura ou usar um GIF menor.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function downloadAsciiPng(params: DownloadParams): Promise<Blob> {
  const response = await fetchWithTimeout(`${API_BASE}/convert/image/render`, {
    method: "POST",
    body: buildConvertFormData(params)
  }, DOWNLOAD_TIMEOUT_MS);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "Falha ao gerar PNG ASCII.");
  }

  return response.blob();
}

export async function downloadAsciiGif(params: DownloadParams): Promise<Blob> {
  const response = await fetchWithTimeout(`${API_BASE}/convert/gif/render`, {
    method: "POST",
    body: buildConvertFormData(params)
  }, DOWNLOAD_TIMEOUT_MS);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "Falha ao gerar GIF ASCII.");
  }

  return response.blob();
}
