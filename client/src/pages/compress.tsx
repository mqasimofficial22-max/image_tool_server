import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Download, Repeat, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { processImage, downloadImage, formatBytes, calculateReduction } from "@/lib/image-api";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedImageResult } from "@shared/schema";

export default function Compress() {
  const [quality, setQuality] = useState([80]);
  const [mode, setMode] = useState<"lossy" | "lossless">("lossy");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
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

  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const processedResult = await processImage("/api/compress", selectedFile, {
        quality: quality[0],
        mode,
      });
      setResult(processedResult);
      toast({
        title: "Success!",
        description: `Image compressed by ${calculateReduction(processedResult.originalSize, processedResult.processedSize)}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compress image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const extension = result.processedFormat === 'jpeg' ? 'jpg' : result.processedFormat;
    downloadImage(result.dataUrl, `compressed-${selectedFile.name.split('.')[0]}.${extension}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Best Free Online Image Compressor
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Use our smart compression technology to dramatically reduce image loading times without visible quality degradation. 
              Choose between Lossless (maximum quality) or Intelligent Lossy (maximum size reduction) modes. 
              Optimized files lead to faster websites and higher conversion rates.
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
                    <div className="flex flex-col items-center justify-center min-h-[320px]" data-testid="container-compress-upload">
                      <div className="rounded-full p-8 bg-primary/10 mb-6">
                        <Upload className="w-16 h-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragging ? "Drop your image here" : "Upload Image to Compress"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click the button below
                      </p>
                      <Button
                        onClick={() => document.getElementById("compress-upload")?.click()}
                        size="lg"
                        data-testid="button-select-file-compress"
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports: JPG, PNG, WebP
                      </p>
                      <input
                        id="compress-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileInput}
                        data-testid="input-compress-upload"
                        aria-label="Upload image file to compress"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{selectedFile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Original Size: <span className="font-mono font-medium">{formatBytes(selectedFile.size)}</span>
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
                            data-testid="img-preview"
                          />
                        </div>
                        {result && (
                          <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                              Compressed <CheckCircle2 className="w-3 h-3 text-green-600" />
                            </p>
                            <img
                              src={result.dataUrl}
                              alt="Compressed"
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
                              <p className="text-sm font-medium mb-1">Compression Result</p>
                              <p className="text-xs text-muted-foreground">
                                {formatBytes(result.originalSize)} → {formatBytes(result.processedSize)}
                              </p>
                              <p className="text-2xl font-bold text-green-600 mt-2">
                                {calculateReduction(result.originalSize, result.processedSize)}% Smaller
                              </p>
                            </div>
                            <Repeat className="w-8 h-8 text-green-600" />
                          </div>
                          <Button className="w-full gap-2" size="lg" onClick={handleDownload} data-testid="button-download">
                            <Download className="w-4 h-4" />
                            Download Compressed Image
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div>
                            <p className="text-sm font-medium mb-1">Estimated Size Reduction</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {mode === "lossless" ? "~30%" : `~${100 - quality[0]}%`}
                            </p>
                          </div>
                          <Button className="gap-2" size="lg" onClick={handleCompress} disabled={isProcessing} data-testid="button-compress">
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Repeat className="w-4 h-4" />
                                Compress Now
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
                  <CardTitle>Compression Settings</CardTitle>
                  <CardDescription>
                    Configure quality and compression mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Compression Mode</Label>
                    <RadioGroup value={mode} onValueChange={(v) => setMode(v as "lossy" | "lossless")} data-testid="radio-compression-mode">
                      <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="lossy" id="lossy" data-testid="radio-lossy" />
                        <Label htmlFor="lossy" className="flex-1 cursor-pointer">
                          <div className="font-medium">Intelligent Lossy</div>
                          <div className="text-xs text-muted-foreground">Maximum size reduction</div>
                        </Label>
                        <Badge variant="secondary">Recommended</Badge>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="lossless" id="lossless" data-testid="radio-lossless" />
                        <Label htmlFor="lossless" className="flex-1 cursor-pointer">
                          <div className="font-medium">Lossless</div>
                          <div className="text-xs text-muted-foreground">Maximum quality</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {mode === "lossy" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Quality</Label>
                        <span className="text-sm font-mono font-medium px-2 py-1 rounded bg-muted" data-testid="text-quality-value">
                          {quality[0]}%
                        </span>
                      </div>
                      <Slider
                        value={quality}
                        onValueChange={setQuality}
                        min={1}
                        max={100}
                        step={1}
                        data-testid="slider-quality"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Lower Quality</span>
                        <span>Higher Quality</span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Quick Tips</h4>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>80% quality offers the best balance</li>
                      <li>Lossless preserves all image data</li>
                      <li>JPG works best with lossy compression</li>
                    </ul>
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
