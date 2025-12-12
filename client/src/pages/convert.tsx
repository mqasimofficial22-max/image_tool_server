import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { processImage, downloadImage, formatBytes } from "@/lib/image-api";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedImageResult } from "@shared/schema";

const formats = ["jpeg", "png", "webp", "gif", "bmp"] as const;

export default function Convert() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("png");
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

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const processedResult = await processImage("/api/convert", selectedFile, {
        targetFormat,
      });
      setResult(processedResult);
      toast({
        title: "Success!",
        description: `Image converted to ${targetFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const extension = result.processedFormat === 'jpeg' ? 'jpg' : result.processedFormat;
    downloadImage(result.dataUrl, `converted-${selectedFile.name.split('.')[0]}.${extension}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Image Converter Online: Convert PNG, JPG, WebP, GIF & More
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              The most flexible online image format tool. Easily switch between common and exotic file types. 
              Need transparency? Convert to PNG. Need the smallest file size? Convert to JPG or WebP. 
              Supports batch conversion for efficiency.
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
                    <div className="flex flex-col items-center justify-center min-h-[320px]" data-testid="container-convert-upload">
                      <div className="rounded-full p-8 bg-primary/10 mb-6">
                        <Upload className="w-16 h-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragging ? "Drop your image here" : "Upload Image to Convert"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click the button below
                      </p>
                      <Button
                        onClick={() => document.getElementById("convert-upload")?.click()}
                        size="lg"
                        data-testid="button-select-file-convert"
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports: JPG, PNG, WebP, GIF, BMP, TIFF, HEIC
                      </p>
                      <input
                        id="convert-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileInput}
                        data-testid="input-convert-upload"
                        aria-label="Upload image file to convert"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{selectedFile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Format: <span className="font-mono font-medium uppercase">{selectedFile.type.split('/')[1] || 'Unknown'}</span>
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
                              Converted <CheckCircle2 className="w-3 h-3 text-green-600" />
                            </p>
                            <img
                              src={result.dataUrl}
                              alt="Converted"
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
                              <p className="text-sm font-medium mb-1">Conversion Complete</p>
                              <p className="text-xs text-muted-foreground">
                                {result.originalFormat?.toUpperCase()} → {result.processedFormat?.toUpperCase()}
                              </p>
                              <p className="text-lg font-bold text-green-600 mt-2">
                                {result.width} × {result.height}px
                              </p>
                            </div>
                            <RefreshCw className="w-8 h-8 text-green-600" />
                          </div>
                          <Button className="w-full gap-2" size="lg" onClick={handleDownload} data-testid="button-download">
                            <Download className="w-4 h-4" />
                            Download Converted Image
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div>
                            <p className="text-sm font-medium mb-1">Converting to</p>
                            <p className="text-2xl font-bold text-blue-600 uppercase">
                              {targetFormat}
                            </p>
                          </div>
                          <Button className="gap-2" size="lg" onClick={handleConvert} disabled={isProcessing} data-testid="button-convert">
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Converting...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                Convert Now
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
                  <CardTitle>Conversion Settings</CardTitle>
                  <CardDescription>
                    Choose target format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Target Format</Label>
                    <Select value={targetFormat} onValueChange={setTargetFormat}>
                      <SelectTrigger data-testid="select-target-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format} value={format} data-testid={`option-${format}`}>
                            {format.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Format Guide</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li><strong>PNG:</strong> Best for transparency & graphics</li>
                      <li><strong>JPG:</strong> Best for photos, smaller sizes</li>
                      <li><strong>WebP:</strong> Modern format, best compression</li>
                      <li><strong>GIF:</strong> Animated images support</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Popular Conversions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTargetFormat("png")}
                        data-testid="button-quick-png"
                      >
                        To PNG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTargetFormat("jpeg")}
                        data-testid="button-quick-jpeg"
                      >
                        To JPG
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTargetFormat("webp")}
                        data-testid="button-quick-webp"
                      >
                        To WebP
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
