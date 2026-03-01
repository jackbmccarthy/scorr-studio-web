"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BrandingConfig {
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  showLogoOnScoreboard?: boolean;
  showSponsorLogo?: boolean;
  sponsorLogoUrl?: string | null;
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  presetTheme?: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  isLoading: boolean;
}

const defaultBranding: BrandingConfig = {
  primaryColor: "#3b82f6",
  secondaryColor: "#1e40af",
  accentColor: "#60a5fa",
  fontFamily: "Space Grotesk",
  showLogoOnScoreboard: true,
  showSponsorLogo: false,
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  children: ReactNode;
  initialBranding?: BrandingConfig;
  tenantId?: string;
}

export function BrandingProvider({ 
  children, 
  initialBranding,
  tenantId 
}: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingConfig>(
    initialBranding || defaultBranding
  );
  const [isLoading, setIsLoading] = useState(false);

  // Apply branding to CSS variables
  useEffect(() => {
    if (branding.primaryColor) {
      document.documentElement.style.setProperty("--brand-primary", branding.primaryColor);
      
      // Parse hex to HSL for brand-primary-h, etc.
      const hex = branding.primaryColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Convert to HSL
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case rNorm:
            h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
            break;
          case gNorm:
            h = ((bNorm - rNorm) / d + 2) / 6;
            break;
          case bNorm:
            h = ((rNorm - gNorm) / d + 4) / 6;
            break;
        }
      }
      
      document.documentElement.style.setProperty("--brand-primary-h", Math.round(h * 360).toString());
      document.documentElement.style.setProperty("--brand-primary-s", `${Math.round(s * 100)}%`);
      document.documentElement.style.setProperty("--brand-primary-l", `${Math.round(l * 100)}%`);
    }
    
    if (branding.fontFamily) {
      document.documentElement.style.setProperty("--brand-font", branding.fontFamily);
    }
  }, [branding]);

  const updateBranding = (updates: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...updates }));
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
