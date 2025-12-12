import { Upload, Settings, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Upload",
    description: "Drag and drop your image files into the tool area above."
  },
  {
    number: "2",
    icon: Settings,
    title: "Optimize",
    description: "Select your desired tool (e.g., \"Compress\") and click the \"Process\" button."
  },
  {
    number: "3",
    icon: Download,
    title: "Download",
    description: "Instantly download the high-quality, optimized version of your image."
  }
];

export function HowItWorks() {
  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Optimize in Three Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-4 relative"
                data-testid={`step-${index + 1}`}
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
                <Badge
                  variant="outline"
                  className="rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold bg-primary text-primary-foreground border-0"
                >
                  {step.number}
                </Badge>
                <div className="rounded-xl bg-background p-4 border">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
