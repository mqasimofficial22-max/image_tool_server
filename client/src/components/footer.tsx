import { useState } from 'react';
import { Link } from "wouter";
import { ChevronDown, ChevronUp, HelpCircle, Twitter, Github, Linkedin, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  // State for FAQ accordion. Defaulting to 0 means the first question is open.
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    // If clicking the already open item, close it (-1), otherwise open the new one
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const faqData = [
    {
      question: "Is TechInfoPlanet free to use?",
      answer: "Yes, TechInfoPlanet is completely free. We believe in providing accessible tools for everyone. You can compress, convert, and resize images without any hidden fees, subscriptions, or credit card requirements."
    },
    {
      question: "Is my data secure?",
      answer: "Security is our top priority. All image processing happens locally in your browser or on secure, ephemeral servers. Your files are automatically deleted permanently within 60 minutes of processing. We do not sell or share your data."
    },
    {
      question: "Does image compression reduce quality?",
      answer: "Our smart compression technology optimizes your images to reduce file size significantly while maintaining visual quality that is nearly indistinguishable from the original. This ensures your website loads faster without sacrificing aesthetics."
    },
    {
      question: "What is the maximum file size reduction with your Image Compressor?",
      answer: "Our Image Compressor can reduce file sizes by up to 80%, depending on the original image format and content. We use advanced algorithms to find the perfect balance between size and quality, making it ideal for web use."
    },
    // {
    //   question: "How does the Background Remover work?",
    //   answer: "We use advanced AI to automatically detect the subject in your photo and remove the background. It works best on images with clearly defined subjects and is perfect for creating product photos or stickers."
    // },
    {
      question: "What image formats do you support?",
      answer: "We support a wide range of modern image formats including JPEG, PNG, WebP, GIF, and TIFF. Our converter tool can handle transformations between any of these formats efficiently while maintaining high quality."
    },
    {
      question: "Can I protect my images using this tool?",
      answer: "Yes, our Image Watermarker allows you to add custom text or logo watermarks to your images. This helps you protect your intellectual property and brand identity before sharing your work online."
    },
    {
      question: "Do I need to create an account?",
      answer: "No account is required. You can start using all our tools, including compression, conversion, resizing, and watermarking, immediately as a guest user."
    }
  ];

  // Generate JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <footer className="w-full border-t bg-background text-foreground">
      {/* Injecting JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-16 pb-8">
        
        {/* FAQ Section */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our tools and services.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div 
                key={index} 
                className={`border rounded-lg transition-all duration-200 ${
                  openIndex === index ? 'bg-card border-primary/20 shadow-sm' : 'bg-transparent hover:bg-muted/50'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-sm md:text-base pr-4">
                    {item.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                
                {/* Using a simple conditional render here. 
                  For smoother animations, you might add a wrapper with max-height transition,
                  but this keeps it clean and performant without extra libraries.
                */}
                {openIndex === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed border-t pt-4 mt-2">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-t pt-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              TechInfoPlanet
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built with speed and simplicity in mind. Process your images securely and efficiently with our free online tools.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Tools</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" data-testid="footer-link-home">
                  <span className="hover:text-primary transition-colors cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/compress" data-testid="footer-link-compress">
                  <span className="hover:text-primary transition-colors cursor-pointer">Image Compressor</span>
                </Link>
              </li>
              <li>
                <Link href="/convert" data-testid="footer-link-convert">
                  <span className="hover:text-primary transition-colors cursor-pointer">Image Converter</span>
                </Link>
              </li>
              <li>
                <Link href="/resize" data-testid="footer-link-resize">
                  <span className="hover:text-primary transition-colors cursor-pointer">Image Resizer</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">About Us</span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Blog (Coming Soon)</span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Contact & Support</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Cookie Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TechInfoPlanet. All rights reserved.
          </p>
          <div className="flex gap-6 items-center">
             <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
               <Twitter className="w-5 h-5" />
             </a>
             {/* <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
               <Github className="w-5 h-5" />
             </a> */}
             <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
               <Linkedin className="w-5 h-5" />
             </a>
             <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
               <Facebook className="w-5 h-5" />
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
}