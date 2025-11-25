import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import { 
  compressImageSchema, 
  convertImageSchema, 
  resizeImageSchema, 
  rotateImageSchema,
  watermarkImageSchema 
} from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/compress", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const validation = compressImageSchema.safeParse(JSON.parse(req.body.settings || "{}"));
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { quality, mode } = validation.data;
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();

      let processedBuffer: Buffer;
      
      if (mode === "lossless") {
        processedBuffer = await image.png({ compressionLevel: 9 }).toBuffer();
      } else {
        if (metadata.format === "png") {
          processedBuffer = await image.png({ quality, compressionLevel: 9 }).toBuffer();
        } else {
          processedBuffer = await image.jpeg({ quality }).toBuffer();
        }
      }

      const stats = await image.stats();
      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();

      res.json({
        originalSize: req.file.size,
        processedSize: processedBuffer.length,
        originalFormat: metadata.format,
        processedFormat: processedMetadata.format,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString('base64')}`
      });
    } catch (error) {
      console.error("Compression error:", error);
      res.status(500).json({ error: "Failed to compress image" });
    }
  });

  app.post("/api/convert", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const validation = convertImageSchema.safeParse(JSON.parse(req.body.settings || "{}"));
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { targetFormat } = validation.data;
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();

      let processedBuffer: Buffer;
      
      switch (targetFormat) {
        case "jpeg":
        case "jpg":
          processedBuffer = await image.jpeg({ quality: 90 }).toBuffer();
          break;
        case "png":
          processedBuffer = await image.png().toBuffer();
          break;
        case "webp":
          processedBuffer = await image.webp({ quality: 90 }).toBuffer();
          break;
        case "gif":
          processedBuffer = await image.gif().toBuffer();
          break;
        case "bmp":
          processedBuffer = await image.toFormat("bmp").toBuffer();
          break;
        default:
          processedBuffer = await image.png().toBuffer();
      }

      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();

      res.json({
        originalSize: req.file.size,
        processedSize: processedBuffer.length,
        originalFormat: metadata.format,
        processedFormat: processedMetadata.format,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        dataUrl: `data:image/${processedMetadata.format === 'jpeg' ? 'jpeg' : processedMetadata.format};base64,${processedBuffer.toString('base64')}`
      });
    } catch (error) {
      console.error("Conversion error:", error);
      res.status(500).json({ error: "Failed to convert image" });
    }
  });

  app.post("/api/resize", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const validation = resizeImageSchema.safeParse(JSON.parse(req.body.settings || "{}"));
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { width, height, scalePercent, maintainAspectRatio } = validation.data;
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();

      let resizeOptions: { width?: number; height?: number; fit?: keyof sharp.FitEnum } = {};

      if (scalePercent) {
        const scale = scalePercent / 100;
        resizeOptions = {
          width: Math.round((metadata.width || 0) * scale),
          height: Math.round((metadata.height || 0) * scale)
        };
      } else if (width || height) {
        resizeOptions = { width, height };
        if (maintainAspectRatio) {
          resizeOptions.fit = "inside";
        }
      }

      const processedBuffer = await image.resize(resizeOptions).toBuffer();
      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();

      res.json({
        originalSize: req.file.size,
        processedSize: processedBuffer.length,
        originalFormat: metadata.format,
        processedFormat: processedMetadata.format,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString('base64')}`
      });
    } catch (error) {
      console.error("Resize error:", error);
      res.status(500).json({ error: "Failed to resize image" });
    }
  });

  app.post("/api/rotate", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const validation = rotateImageSchema.safeParse(JSON.parse(req.body.settings || "{}"));
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { degrees, flipHorizontal, flipVertical } = validation.data;
      let image = sharp(req.file.buffer);
      const metadata = await image.metadata();

      image = image.rotate(parseInt(degrees));
      
      if (flipHorizontal) {
        image = image.flop();
      }
      
      if (flipVertical) {
        image = image.flip();
      }

      const processedBuffer = await image.toBuffer();
      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();

      res.json({
        originalSize: req.file.size,
        processedSize: processedBuffer.length,
        originalFormat: metadata.format,
        processedFormat: processedMetadata.format,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString('base64')}`
      });
    } catch (error) {
      console.error("Rotate error:", error);
      res.status(500).json({ error: "Failed to rotate image" });
    }
  });

  app.post("/api/watermark", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const validation = watermarkImageSchema.safeParse(JSON.parse(req.body.settings || "{}"));
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { text, position, opacity, fontSize } = validation.data;
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();

      const width = metadata.width || 800;
      const height = metadata.height || 600;

      const textSvg = Buffer.from(
        `<svg width="${width}" height="${height}">
          <text 
            x="${getXPosition(position, width)}" 
            y="${getYPosition(position, height)}" 
            font-family="Arial, sans-serif" 
            font-size="${fontSize}" 
            fill="white" 
            opacity="${opacity}"
            text-anchor="${position.includes('right') ? 'end' : position === 'center' ? 'middle' : 'start'}"
            style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);"
          >${text}</text>
        </svg>`
      );

      const processedBuffer = await image
        .composite([{ input: textSvg, top: 0, left: 0 }])
        .toBuffer();

      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();

      res.json({
        originalSize: req.file.size,
        processedSize: processedBuffer.length,
        originalFormat: metadata.format,
        processedFormat: processedMetadata.format,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString('base64')}`
      });
    } catch (error) {
      console.error("Watermark error:", error);
      res.status(500).json({ error: "Failed to add watermark" });
    }
  });

  app.post("/api/info", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();
      const stats = await image.stats();

      res.json({
        filename: req.file.originalname,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: req.file.size,
        colorSpace: metadata.space,
        hasAlpha: metadata.hasAlpha
      });
    } catch (error) {
      console.error("Info error:", error);
      res.status(500).json({ error: "Failed to get image info" });
    }
  });

  app.post("/api/remove-background", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      res.status(501).json({ 
        error: "Advanced AI background removal requires external AI services (e.g., Remove.bg, DeepAI). This is a demo placeholder. For production use, please integrate with a dedicated background removal API service." 
      });
    } catch (error) {
      console.error("Background removal error:", error);
      res.status(500).json({ error: "Background removal is currently unavailable." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

function getXPosition(position: string, width: number): number {
  if (position.includes('left')) return 30;
  if (position.includes('right')) return width - 30;
  return width / 2;
}

function getYPosition(position: string, height: number): number {
  if (position.includes('top')) return 50;
  if (position.includes('bottom')) return height - 30;
  return height / 2;
}
