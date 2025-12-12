import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              <img src="/techinfo_logo_large_v1.png" alt="TechInfoPlanet Image Tool" className="block dark:hidden"/>
              <img src="/techinfo_logo_light.png" alt="TechInfoPlanet Image Tool" className="hidden dark:block"/>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/compress" data-testid="link-compress">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/compress" ? "text-primary" : "text-foreground"
              }`}>
                Compress
              </span>
            </Link>
            <Link href="/convert" data-testid="link-convert">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/convert" ? "text-primary" : "text-foreground"
              }`}>
                Convert
              </span>
            </Link>
            <Link href="/resize" data-testid="link-resize">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/resize" ? "text-primary" : "text-foreground"
              }`}>
                Resize
              </span>
            </Link>
            <Link href="/" data-testid="link-all-tools">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-primary" : "text-foreground"
              }`}>
                All Tools
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
