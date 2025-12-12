import type { ProcessedImageResult, ImageMetadata } from "@shared/schema";

export async function processImage(
  endpoint: string,
  file: File,
  settings: Record<string, any>
): Promise<ProcessedImageResult> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("settings", JSON.stringify(settings));

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process image");
  }

  return response.json();
}

export async function getImageInfo(file: File): Promise<ImageMetadata> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/info", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get image info");
  }

  return response.json();
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function calculateReduction(original: number, processed: number): number {
  return Math.round(((original - processed) / original) * 100);
}
