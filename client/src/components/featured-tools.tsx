import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Repeat, RefreshCw, Maximize2, Eraser, RotateCw, Droplet, Info } from "lucide-react";
import { useLocation } from "wouter";

const tools = [
  {
    id: "compress",
    icon: Repeat,
    title: "Image Compressor",
    description: "Lossless and intelligent lossy compression for JPG, PNG, and WebP. Reduce size by up to 80%.",
    path: "/compress",
    keywords: "compress jpeg, reduce image size"
  },
  {
    id: "convert",
    icon: RefreshCw,
    title: "Universal Image Converter",
    description: "Convert any format (HEIC, TIFF, GIF, BMP) to standardized web formats (JPG, PNG, WebP).",
    path: "/convert",
    keywords: "png to jpg, webp converter"
  },
  {
    id: "resize",
    icon: Maximize2,
    title: "Image Resizer & Cropper",
    description: "Set exact pixel dimensions, aspect ratios (16:9, 4:3), or resize by percentage. Perfect for social media.",
    path: "/resize",
    keywords: "free image resizer, crop photo online"
  },
  // {
  //   id: "background",
  //   icon: Eraser,
  //   title: "Background Remover (Demo)",
  //   description: "UI demo for AI-powered background removal. Production requires external AI service integration.",
  //   path: "/background-remover",
  //   keywords: "remove background from photo"
  // },
  {
    id: "rotate",
    icon: RotateCw,
    title: "Image Rotator & Flipper",
    description: "Correct orientation, rotate 90°, 180°, or mirror images horizontally and vertically.",
    path: "/rotate",
    keywords: "rotate image online"
  },
  {
    id: "watermark",
    icon: Droplet,
    title: "Image Watermarker",
    description: "Protect your images by adding custom text or logo watermarks.",
    path: "/watermark",
    keywords: "add watermark to photo"
  },
  {
    id: "info",
    icon: Info,
    title: "Image Format Info",
    description: "View detailed metadata, color profile, and resolution information for any file.",
    path: "/info",
    keywords: "image metadata checker"
  }
];

export function FeaturedTools() {
  const [, setLocation] = useLocation();

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Professional Image Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to optimize, convert, and enhance your images for the web
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="hover-elevate transition-all duration-200"
                data-testid={`card-tool-${tool.id}`}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="rounded-xl bg-primary/10 p-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed min-h-[3rem]">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => setLocation(tool.path)}
                    data-testid={`button-start-${tool.id}`}
                  >
                    Start Tool
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
