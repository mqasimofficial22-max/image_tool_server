import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, Download, Maximize2, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { processImage, downloadImage, formatBytes } from "@/lib/image-api";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedImageResult } from "@shared/schema";

export default function Resize() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [scalePercent, setScalePercent] = useState<string>("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const { toast } = useToast();

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
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
      img.src = e.target?.result as string;
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  useEffect(() => {
    if (maintainAspectRatio && originalDimensions.width && originalDimensions.height) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      if (width && !scalePercent) {
        const newHeight = Math.round(parseInt(width) / aspectRatio);
        setHeight(newHeight.toString());
      } else if (height && !scalePercent) {
        const newWidth = Math.round(parseInt(height) * aspectRatio);
        setWidth(newWidth.toString());
      }
    }
  }, [width, height, maintainAspectRatio, originalDimensions, scalePercent]);

  const handleResize = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const settings: any = { maintainAspectRatio };
      
      if (scalePercent) {
        settings.scalePercent = parseFloat(scalePercent);
      } else {
        if (width) settings.width = parseInt(width);
        if (height) settings.height = parseInt(height);
      }

      const processedResult = await processImage("/api/resize", selectedFile, settings);
      setResult(processedResult);
      toast({
        title: "Success!",
        description: `Image resized to ${processedResult.width} × ${processedResult.height}px`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resize image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const extension = result.processedFormat === 'jpeg' ? 'jpg' : result.processedFormat;
    downloadImage(result.dataUrl, `resized-${selectedFile.name.split('.')[0]}.${extension}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Online Image Resizer & Aspect Ratio Tool
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Accurately adjust the dimensions of your photos for email, web banners, or printing. 
              You can resize by entering precise pixel values for width and height, or scale the image by a percentage (e.g., 50%). 
              Maintain aspect ratio lock to prevent stretching or distortion.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card
                className={`transition-all duration-300 ${
                  isDragging ? "border-primary border-2 shadow-lg" : "border-dashed border-2"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardContent className="p-8">
                  {!selectedFile ? (
                    <div className="flex flex-col items-center justify-center min-h-[320px]" data-testid="container-resize-upload">
                      <div className="rounded-full p-8 bg-primary/10 mb-6">
                        <Upload className="w-16 h-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragging ? "Drop your image here" : "Upload Image to Resize"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click the button below
                      </p>
                      <Button
                        onClick={() => document.getElementById("resize-upload")?.click()}
                        size="lg"
                        data-testid="button-select-file-resize"
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports: JPG, PNG, WebP, GIF
                      </p>
                      <input
                        id="resize-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileInput}
                        data-testid="input-resize-upload"
                        aria-label="Upload image file to resize"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{selectedFile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Original: <span className="font-mono font-medium">{originalDimensions.width} × {originalDimensions.height}px</span>
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview("");
                            setResult(null);
                            setWidth("");
                            setHeight("");
                          }}
                          data-testid="button-remove-file"
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg border p-4 bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-2">Original</p>
                          <img
                            src={preview}
                            alt="Original"
                            className="w-full h-auto object-contain max-h-64"
                            data-testid="img-preview"
                          />
                        </div>
                        {result && (
                          <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                              Resized <CheckCircle2 className="w-3 h-3 text-green-600" />
                            </p>
                            <img
                              src={result.dataUrl}
                              alt="Resized"
                              className="w-full h-auto object-contain max-h-64"
                              data-testid="img-result"
                            />
                          </div>
                        )}
                      </div>

                      <Separator />

                      {result ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div>
                              <p className="text-sm font-medium mb-1">Resize Complete</p>
                              <p className="text-xs text-muted-foreground">
                                {originalDimensions.width} × {originalDimensions.height}px → {result.width} × {result.height}px
                              </p>
                              <p className="text-lg font-bold text-green-600 mt-2 font-mono">
                                {result.width} × {result.height}px
                              </p>
                            </div>
                            <Maximize2 className="w-8 h-8 text-green-600" />
                          </div>
                          <Button className="w-full gap-2" size="lg" onClick={handleDownload} data-testid="button-download">
                            <Download className="w-4 h-4" />
                            Download Resized Image
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <div>
                            <p className="text-sm font-medium mb-1">New Dimensions</p>
                            <p className="text-2xl font-bold text-purple-600 font-mono">
                              {width || "—"} × {height || "—"}px
                            </p>
                          </div>
                          <Button className="gap-2" size="lg" onClick={handleResize} disabled={isProcessing || (!width && !height && !scalePercent)} data-testid="button-resize">
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Resizing...
                              </>
                            ) : (
                              <>
                                <Maximize2 className="w-4 h-4" />
                                Resize Now
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resize Settings</CardTitle>
                  <CardDescription>
                    Configure dimensions and scaling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Lock Aspect Ratio</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={maintainAspectRatio}
                          onCheckedChange={setMaintainAspectRatio}
                          data-testid="switch-aspect-ratio"
                        />
                        <Lock className={`w-4 h-4 ${maintainAspectRatio ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Dimensions (px)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="width" className="text-sm">Width</Label>
                        <Input
                          id="width"
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          placeholder="Width"
                          data-testid="input-width"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm">Height</Label>
                        <Input
                          id="height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Height"
                          data-testid="input-height"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label htmlFor="scale" className="text-base font-semibold">Scale by Percentage</Label>
                    <Input
                      id="scale"
                      type="number"
                      value={scalePercent}
                      onChange={(e) => {
                        setScalePercent(e.target.value);
                        setWidth("");
                        setHeight("");
                      }}
                      placeholder="e.g., 50"
                      data-testid="input-scale"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter percentage to scale (e.g., 50 = half size, 200 = double size)
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Common Sizes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth("1920");
                          setHeight("1080");
                          setScalePercent("");
                        }}
                        data-testid="button-preset-1080p"
                      >
                        1080p
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth("1280");
                          setHeight("720");
                          setScalePercent("");
                        }}
                        data-testid="button-preset-720p"
                      >
                        720p
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth("800");
                          setHeight("600");
                          setScalePercent("");
                        }}
                        data-testid="button-preset-800x600"
                      >
                        800×600
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth("500");
                          setHeight("500");
                          setScalePercent("");
                        }}
                        data-testid="button-preset-square"
                      >
                        Square
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
