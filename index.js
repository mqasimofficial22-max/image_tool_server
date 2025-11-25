// server/index-prod.ts
import fs from "node:fs";
import path from "node:path";
import express2 from "express";

// server/app.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import sharp from "sharp";

// shared/schema.ts
import { z } from "zod";
var ImageFormatEnum = z.enum([
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "bmp",
  "tiff",
  "heic"
]);
var CompressionModeEnum = z.enum(["lossless", "lossy"]);
var compressImageSchema = z.object({
  quality: z.number().min(1).max(100).default(80),
  mode: CompressionModeEnum.default("lossy"),
  format: ImageFormatEnum.optional()
});
var convertImageSchema = z.object({
  targetFormat: ImageFormatEnum
});
var resizeImageSchema = z.object({
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  scalePercent: z.number().positive().max(1e3).optional(),
  maintainAspectRatio: z.boolean().default(true)
});
var rotateImageSchema = z.object({
  degrees: z.enum(["90", "180", "270"]),
  flipHorizontal: z.boolean().default(false),
  flipVertical: z.boolean().default(false)
});
var watermarkImageSchema = z.object({
  text: z.string().min(1),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"]).default("bottom-right"),
  opacity: z.number().min(0).max(1).default(0.5),
  fontSize: z.number().positive().default(24)
});

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  app2.post("/api/compress", upload.single("image"), async (req, res) => {
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
      let processedBuffer;
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
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString("base64")}`
      });
    } catch (error) {
      console.error("Compression error:", error);
      res.status(500).json({ error: "Failed to compress image" });
    }
  });
  app2.post("/api/convert", upload.single("image"), async (req, res) => {
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
      let processedBuffer;
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
        dataUrl: `data:image/${processedMetadata.format === "jpeg" ? "jpeg" : processedMetadata.format};base64,${processedBuffer.toString("base64")}`
      });
    } catch (error) {
      console.error("Conversion error:", error);
      res.status(500).json({ error: "Failed to convert image" });
    }
  });
  app2.post("/api/resize", upload.single("image"), async (req, res) => {
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
      let resizeOptions = {};
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
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString("base64")}`
      });
    } catch (error) {
      console.error("Resize error:", error);
      res.status(500).json({ error: "Failed to resize image" });
    }
  });
  app2.post("/api/rotate", upload.single("image"), async (req, res) => {
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
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString("base64")}`
      });
    } catch (error) {
      console.error("Rotate error:", error);
      res.status(500).json({ error: "Failed to rotate image" });
    }
  });
  app2.post("/api/watermark", upload.single("image"), async (req, res) => {
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
            text-anchor="${position.includes("right") ? "end" : position === "center" ? "middle" : "start"}"
            style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);"
          >${text}</text>
        </svg>`
      );
      const processedBuffer = await image.composite([{ input: textSvg, top: 0, left: 0 }]).toBuffer();
      const processedImage = sharp(processedBuffer);
      const processedMetadata = await processedImage.metadata();
      res.json({
        originalSize: req.file.size,
        processedSize: processedBuffer.length,
        originalFormat: metadata.format,
        processedFormat: processedMetadata.format,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        dataUrl: `data:image/${processedMetadata.format};base64,${processedBuffer.toString("base64")}`
      });
    } catch (error) {
      console.error("Watermark error:", error);
      res.status(500).json({ error: "Failed to add watermark" });
    }
  });
  app2.post("/api/info", upload.single("image"), async (req, res) => {
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
  app2.post("/api/remove-background", upload.single("image"), async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}
function getXPosition(position, width) {
  if (position.includes("left")) return 30;
  if (position.includes("right")) return width - 30;
  return width / 2;
}
function getYPosition(position, height) {
  if (position.includes("top")) return 50;
  if (position.includes("bottom")) return height - 30;
  return height / 2;
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express();
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  await setup(app, server);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    // host: "beta.techinfoplanet.com",
    host: "127.0.0.1"
    // reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
}

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};
