import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Droplet, Loader2, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { processImage, downloadImage } from "@/lib/image-api";
import { useToast } from "@/hooks/use-toast";
import type { ProcessedImageResult } from "@shared/schema";

const positions = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" }
] as const;

export default function Watermark() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [text, setText] = useState("");
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState([24]);
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

  const handleWatermark = async () => {
    if (!selectedFile || !text) return;

    setIsProcessing(true);
    try {
      const processedResult = await processImage("/api/watermark", selectedFile, {
        text,
        position,
        opacity: opacity[0] / 100,
        fontSize: fontSize[0],
      });
      setResult(processedResult);
      toast({
        title: "Success!",
        description: "Watermark added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add watermark",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const extension = result.processedFormat === 'jpeg' ? 'jpg' : result.processedFormat;
    downloadImage(result.dataUrl, `watermarked-${selectedFile.name.split('.')[0]}.${extension}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Add Watermark to Your Images
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Protect your images by adding custom text or logo watermarks. 
              Perfect for photographers, designers, and content creators who want to protect their intellectual property.
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
                    <div className="flex flex-col items-center justify-center min-h-[320px]" data-testid="container-watermark-upload">
                      <div className="rounded-full p-8 bg-primary/10 mb-6">
                        <Upload className="w-16 h-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragging ? "Drop your image here" : "Upload Image for Watermark"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click the button below
                      </p>
                      <Button
                        onClick={() => document.getElementById("watermark-upload")?.click()}
                        size="lg"
                        data-testid="button-select-file-watermark"
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports: JPG, PNG, WebP
                      </p>
                      <input
                        id="watermark-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileInput}
                        data-testid="input-watermark-upload"
                        aria-label="Upload image file to add watermark"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{selectedFile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ready for watermarking
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
                        <div className="rounded-lg border p-4 bg-muted/30 relative">
                          <p className="text-xs text-muted-foreground mb-2">Preview with Watermark</p>
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto object-contain max-h-64"
                            data-testid="img-preview"
                          />
                          {text && (
                            <div
                              className="absolute"
                              style={{
                                fontSize: `${fontSize[0]}px`,
                                opacity: opacity[0] / 100,
                                color: "white",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                fontWeight: "bold",
                                ...(position === "top-left" && { top: "3rem", left: "2rem" }),
                                ...(position === "top-right" && { top: "3rem", right: "2rem" }),
                                ...(position === "center" && { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }),
                                ...(position === "bottom-left" && { bottom: "2rem", left: "2rem" }),
                                ...(position === "bottom-right" && { bottom: "2rem", right: "2rem" })
                              }}
                              data-testid="text-watermark-preview"
                            >
                              {text}
                            </div>
                          )}
                        </div>
                        {result && (
                          <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                              Watermarked <CheckCircle2 className="w-3 h-3 text-green-600" />
                            </p>
                            <img
                              src={result.dataUrl}
                              alt="Watermarked"
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
                              <p className="text-sm font-medium mb-1">Watermark Added</p>
                              <p className="text-lg font-bold text-green-600">
                                {text}
                              </p>
                            </div>
                            <Droplet className="w-8 h-8 text-green-600" />
                          </div>
                          <Button className="w-full gap-2" size="lg" onClick={handleDownload} data-testid="button-download">
                            <Download className="w-4 h-4" />
                            Download Watermarked Image
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                          <div>
                            <p className="text-sm font-medium mb-1">Watermark Preview</p>
                            <p className="text-lg font-bold text-cyan-600">
                              {text || "Enter watermark text"}
                            </p>
                          </div>
                          <Button className="gap-2" size="lg" onClick={handleWatermark} disabled={isProcessing || !text} data-testid="button-watermark">
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Droplet className="w-4 h-4" />
                                Add Watermark
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
                  <CardTitle>Watermark Settings</CardTitle>
                  <CardDescription>
                    Customize your watermark
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="watermark-text" className="text-base font-semibold">Watermark Text</Label>
                    <Input
                      id="watermark-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="© Your Name 2024"
                      data-testid="input-watermark-text"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Position</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger data-testid="select-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value} data-testid={`option-${pos.value}`}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Opacity</Label>
                      <span className="text-sm font-mono font-medium px-2 py-1 rounded bg-muted" data-testid="text-opacity-value">
                        {opacity[0]}%
                      </span>
                    </div>
                    <Slider
                      value={opacity}
                      onValueChange={setOpacity}
                      min={10}
                      max={100}
                      step={5}
                      data-testid="slider-opacity"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Font Size</Label>
                      <span className="text-sm font-mono font-medium px-2 py-1 rounded bg-muted" data-testid="text-fontsize-value">
                        {fontSize[0]}px
                      </span>
                    </div>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={12}
                      max={72}
                      step={2}
                      data-testid="slider-fontsize"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Tips</h4>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Keep opacity around 30-60% for subtle protection</li>
                      <li>Use © symbol for copyright watermarks</li>
                      <li>Position in corners to avoid blocking content</li>
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
