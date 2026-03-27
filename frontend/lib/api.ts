export type ConvertMode = "image" | "gif";

export type ConvertParams = {
  file: File;
  width: number;
  charset: string;
  invert: boolean;
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

type DownloadParams = {
  file: File;
  width: number;
  charset: string;
  invert: boolean;
};

export async function convertToAscii(params: ConvertParams): Promise<ImageResult | GifResult> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("width", String(params.width));
  formData.append("charset", params.charset);
  formData.append("invert", String(params.invert));

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
  return formData;
}

export async function downloadAsciiPng(params: DownloadParams): Promise<Blob> {
  const response = await fetch(`${API_BASE}/convert/image/render`, {
    method: "POST",
    body: buildConvertFormData(params)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "Falha ao gerar PNG ASCII.");
  }

  return response.blob();
}

export async function downloadAsciiGif(params: DownloadParams): Promise<Blob> {
  const response = await fetch(`${API_BASE}/convert/gif/render`, {
    method: "POST",
    body: buildConvertFormData(params)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "Falha ao gerar GIF ASCII.");
  }

  return response.blob();
}
