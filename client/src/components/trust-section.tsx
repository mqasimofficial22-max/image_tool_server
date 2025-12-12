import { Shield, Trash2, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "All uploads and downloads are handled over secure HTTPS. Your data is protected from the moment you upload."
  },
  {
    icon: Trash2,
    title: "Automatic Deletion",
    description: "Files are processed instantly and automatically purged from our servers within 1 hour. We value your privacy."
  },
  {
    icon: Zap,
    title: "Cloud-Powered Speed",
    description: "Powered by efficient cloud infrastructure to deliver results in milliseconds, not minutes."
  }
];

export function TrustSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Files are Secure. Your Results are Fast.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-4"
                data-testid={`trust-feature-${index}`}
              >
                <div className="rounded-2xl bg-primary/10 p-6">
                  <Icon className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
