import { z } from "zod";

export const ImageFormatEnum = z.enum([
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "bmp",
  "tiff",
  "heic"
]);

export const CompressionModeEnum = z.enum(["lossless", "lossy"]);

export const compressImageSchema = z.object({
  quality: z.number().min(1).max(100).default(80),
  mode: CompressionModeEnum.default("lossy"),
  format: ImageFormatEnum.optional(),
});

export const convertImageSchema = z.object({
  targetFormat: ImageFormatEnum,
});

export const resizeImageSchema = z.object({
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  scalePercent: z.number().positive().max(1000).optional(),
  maintainAspectRatio: z.boolean().default(true),
});

export const rotateImageSchema = z.object({
  degrees: z.enum(["90", "180", "270"]),
  flipHorizontal: z.boolean().default(false),
  flipVertical: z.boolean().default(false),
});

export const watermarkImageSchema = z.object({
  text: z.string().min(1),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"]).default("bottom-right"),
  opacity: z.number().min(0).max(1).default(0.5),
  fontSize: z.number().positive().default(24),
});

export type CompressImageInput = z.infer<typeof compressImageSchema>;
export type ConvertImageInput = z.infer<typeof convertImageSchema>;
export type ResizeImageInput = z.infer<typeof resizeImageSchema>;
export type RotateImageInput = z.infer<typeof rotateImageSchema>;
export type WatermarkImageInput = z.infer<typeof watermarkImageSchema>;
export type ImageFormat = z.infer<typeof ImageFormatEnum>;

export interface ProcessedImageResult {
  originalSize: number;
  processedSize: number;
  originalFormat: string;
  processedFormat: string;
  width: number;
  height: number;
  dataUrl: string;
}

export interface ImageMetadata {
  filename: string;
  format: string;
  width: number;
  height: number;
  size: number;
  colorSpace?: string;
  hasAlpha: boolean;
}
