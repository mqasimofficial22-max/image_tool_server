import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Eraser, Loader2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { processImage, downloadImage } from "@/lib/image-api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ProcessedImageResult } from "@shared/schema";

export default function BackgroundRemover() {
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

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const processedResult = await processImage("/api/remove-background", selectedFile, {});
      setResult(processedResult);
      toast({
        title: "Success!",
        description: "Background removed successfully",
      });
    } catch (error) {
      toast({
        title: "Feature Not Available",
        description: error instanceof Error ? error.message : "Advanced AI background removal requires external service integration. This is a demo placeholder.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    downloadImage(result.dataUrl, `no-bg-${selectedFile.name.split('.')[0]}.png`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Background Remover (Demo)
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              This feature demonstrates the UI for AI-powered background removal. 
              Production implementation requires integration with external AI services like Remove.bg or DeepAI for actual background removal.
            </p>
          </div>
          <Alert className="mb-6" data-testid="alert-demo-notice">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Feature:</strong> Advanced AI background removal requires external AI services (e.g., Remove.bg, DeepAI). 
              This is a placeholder to demonstrate the UI. For production use, integrate with a dedicated background removal API service.
            </AlertDescription>
          </Alert>

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
                    <div className="flex flex-col items-center justify-center min-h-[320px]" data-testid="container-bg-upload">
                      <div className="rounded-full p-8 bg-primary/10 mb-6">
                        <Upload className="w-16 h-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {isDragging ? "Drop your image here" : "Upload Image"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click the button below
                      </p>
                      <Button
                        onClick={() => document.getElementById("bg-upload")?.click()}
                        size="lg"
                        data-testid="button-select-file-bg"
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports: JPG, PNG, WebP
                      </p>
                      <input
                        id="bg-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileInput}
                        data-testid="input-bg-upload"
                        aria-label="Upload image file for demo background removal"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{selectedFile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ready for background removal
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

                      <div className="rounded-lg border p-4 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-2">Original</p>
                        <img
                          src={preview}
                          alt="Original"
                          className="max-w-full h-auto mx-auto max-h-96 object-contain"
                          data-testid="img-preview"
                        />
                      </div>

                      <Separator />

                      {result ? (
                        <div className="space-y-4">
                          <div className="rounded-lg border p-4" style={{ 
                            backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                          }}>
                            <p className="text-xs text-muted-foreground mb-2">Result (Transparent Background)</p>
                            <img
                              src={result.dataUrl}
                              alt="Result"
                              className="max-w-full h-auto mx-auto max-h-96 object-contain"
                              data-testid="img-result"
                            />
                          </div>
                          <Button className="w-full gap-2" size="lg" onClick={handleDownload} data-testid="button-download">
                            <Download className="w-4 h-4" />
                            Download PNG with Transparency
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                          <div>
                            <p className="text-sm font-medium mb-1">AI Background Removal</p>
                            <p className="text-2xl font-bold text-pink-600">
                              Ready to Process
                            </p>
                          </div>
                          <Button className="gap-2" size="lg" onClick={handleRemoveBackground} disabled={isProcessing} data-testid="button-remove-bg">
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Eraser className="w-4 h-4" />
                                Remove Background
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
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>
                    AI-powered background removal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium mb-1">Upload Your Image</p>
                        <p className="text-xs text-muted-foreground">Choose any image with a clear subject</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium mb-1">AI Processing</p>
                        <p className="text-xs text-muted-foreground">Our AI identifies and removes the background</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium mb-1">Download PNG</p>
                        <p className="text-xs text-muted-foreground">Get your image with transparent background</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Best Results Tips</h4>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Use images with clear subject-background separation</li>
                      <li>High contrast between subject and background works best</li>
                      <li>Avoid complex backgrounds for better accuracy</li>
                      <li>Output will be PNG format with transparency</li>
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
