import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Upload, Download, RotateCw, FlipHorizontal, FlipVertical, Loader2, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { processImage, downloadImage } from "@/lib/image-api";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedImageResult } from "@shared/schema";

export default function Rotate() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [rotation, setRotation] = useState<"90" | "180" | "270">("90");
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
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

  const handleRotate = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const processedResult = await processImage("/api/rotate", selectedFile, {
        degrees: rotation,
        flipHorizontal,
        flipVertical,
      });
      setResult(processedResult);
      toast({
        title: "Success!",
        description: "Image transformed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rotate image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const extension = result.processedFormat === 'jpeg' ? 'jpg' : result.processedFormat;
    downloadImage(result.dataUrl, `rotated-${selectedFile.name.split('.')[0]}.${extension}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Image Rotator & Flipper Online
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Correct orientation, rotate 90°, 180°, or mirror images horizontally and vertically. 
              Perfect for fixing incorrectly oriented photos or creating mirrored effects.
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
                    <div className="flex flex-col items-center justify-center min-h-[320px]" data-testid="container-rotate-upload">
                      <div className="rounded-full p-8 bg-primary/10 mb-6">
                        <Upload className="w-16 h-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragging ? "Drop your image here" : "Upload Image to Rotate/Flip"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click the button below
                      </p>
                      <Button
                        onClick={() => document.getElementById("rotate-upload")?.click()}
                        size="lg"
                        data-testid="button-select-file-rotate"
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports: JPG, PNG, WebP, GIF
                      </p>
                      <input
                        id="rotate-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileInput}
                        data-testid="input-rotate-upload"
                        aria-label="Upload image file to rotate or flip"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{selectedFile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ready to transform
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview("");
                            setResult(null);
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
                          />
                        </div>
                        {result ? (
                          <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                              Transformed <CheckCircle2 className="w-3 h-3 text-green-600" />
                            </p>
                            <img
                              src={result.dataUrl}
                              alt="Transformed"
                              className="w-full h-auto object-contain max-h-64"
                              data-testid="img-result"
                            />
                          </div>
                        ) : (
                          <div className="rounded-lg border p-4 bg-muted/30 flex items-center justify-center">
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-auto object-contain max-h-64"
                              style={{
                                transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                                transition: "transform 0.3s ease"
                              }}
                              data-testid="img-preview"
                            />
                          </div>
                        )}
                      </div>

                      <Separator />

                      {result ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div>
                              <p className="text-sm font-medium mb-1">Transformation Complete</p>
                              <p className="text-lg font-bold text-green-600">
                                Rotate {rotation}° {flipHorizontal && "· Flip H"} {flipVertical && "· Flip V"}
                              </p>
                            </div>
                            <RotateCw className="w-8 h-8 text-green-600" />
                          </div>
                          <Button className="w-full gap-2" size="lg" onClick={handleDownload} data-testid="button-download">
                            <Download className="w-4 h-4" />
                            Download Transformed Image
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <div>
                            <p className="text-sm font-medium mb-1">Transformations Applied</p>
                            <p className="text-lg font-bold text-orange-600">
                              Rotate {rotation}° {flipHorizontal && "· Flip H"} {flipVertical && "· Flip V"}
                            </p>
                          </div>
                          <Button className="gap-2" size="lg" onClick={handleRotate} disabled={isProcessing} data-testid="button-rotate">
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <RotateCw className="w-4 h-4" />
                                Apply Now
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
                  <CardTitle>Rotation Settings</CardTitle>
                  <CardDescription>
                    Choose rotation and flip options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Rotation Angle</Label>
                    <RadioGroup value={rotation} onValueChange={(v) => setRotation(v as "90" | "180" | "270")} data-testid="radio-rotation">
                      <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="90" id="r90" data-testid="radio-90" />
                        <Label htmlFor="r90" className="flex-1 cursor-pointer">
                          90° Clockwise
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="180" id="r180" data-testid="radio-180" />
                        <Label htmlFor="r180" className="flex-1 cursor-pointer">
                          180° (Upside Down)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="270" id="r270" data-testid="radio-270" />
                        <Label htmlFor="r270" className="flex-1 cursor-pointer">
                          270° (90° Counter-Clockwise)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Flip Options</Label>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FlipHorizontal className="w-5 h-5 text-primary" />
                        <div>
                          <Label htmlFor="flip-h" className="cursor-pointer font-medium">Flip Horizontal</Label>
                          <p className="text-xs text-muted-foreground">Mirror left to right</p>
                        </div>
                      </div>
                      <Switch
                        id="flip-h"
                        checked={flipHorizontal}
                        onCheckedChange={setFlipHorizontal}
                        data-testid="switch-flip-horizontal"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FlipVertical className="w-5 h-5 text-primary" />
                        <div>
                          <Label htmlFor="flip-v" className="cursor-pointer font-medium">Flip Vertical</Label>
                          <p className="text-xs text-muted-foreground">Mirror top to bottom</p>
                        </div>
                      </div>
                      <Switch
                        id="flip-v"
                        checked={flipVertical}
                        onCheckedChange={setFlipVertical}
                        data-testid="switch-flip-vertical"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRotation("90");
                          setFlipHorizontal(false);
                          setFlipVertical(false);
                        }}
                        data-testid="button-reset"
                      >
                        Reset All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFlipHorizontal(!flipHorizontal)}
                        data-testid="button-toggle-h"
                      >
                        Toggle H
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
