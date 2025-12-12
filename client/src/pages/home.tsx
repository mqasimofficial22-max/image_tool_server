import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturedTools } from "@/components/featured-tools";
import { TrustSection } from "@/components/trust-section";
import { HowItWorks } from "@/components/how-it-works";
import { Footer } from "@/components/footer";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setLocation("/compress");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection onFilesSelected={handleFilesSelected} />
        <FeaturedTools />
        <TrustSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
