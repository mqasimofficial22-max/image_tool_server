import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Maximize2, RefreshCw, Repeat } from "lucide-react";
import { useLocation } from "wouter";

interface HeroSectionProps {
  onFilesSelected?: (files: File[]) => void;
}

export function HeroSection({ onFilesSelected }: HeroSectionProps) {
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith("image/")
    );
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  The Ultimate Free Image Toolkit
                </span>
              </h1>
              <h2 className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
                Compress, Convert, Edit & Enhance Instantly
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Stop compromising quality for speed. Optimize your JPEGs, PNGs, and WebP files for perfect performance and better SEO, all in one intuitive platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/compress")}
                data-testid="button-hero-compress"
                className="gap-2"
              >
                <Repeat className="w-4 h-4" />
                Start Compressing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/convert")}
                data-testid="button-hero-convert"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Convert Images
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>No Registration</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card
              className={`relative overflow-visible transition-all duration-300 ${
                isDragging ? "border-primary border-2 shadow-lg scale-[1.02]" : "border-dashed border-2"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center p-12 md:p-16 cursor-pointer hover-elevate active-elevate-2"
                data-testid="label-file-upload"
              >
                <div className={`rounded-full p-6 mb-6 transition-colors ${
                  isDragging ? "bg-primary/20" : "bg-primary/10"
                }`}>
                  <Upload className={`w-12 h-12 transition-colors ${
                    isDragging ? "text-primary" : "text-primary/70"
                  }`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragging ? "Drop your images here" : "Drag & Drop Images Here"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse (supports batch upload)
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, WebP, GIF, BMP, TIFF, HEIC
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                  data-testid="input-file-upload"
                />
              </label>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/compress")}
                data-testid="button-quick-compress"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Repeat className="w-5 h-5" />
                <span className="text-xs">Compress</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/convert")}
                data-testid="button-quick-convert"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-xs">Convert</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/resize")}
                data-testid="button-quick-resize"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Maximize2 className="w-5 h-5" />
                <span className="text-xs">Resize</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
