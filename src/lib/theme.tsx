// Theme Configuration for Tenant Branding

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ==========================================
// TYPES
// ==========================================

export interface BrandingConfig {
  logoUrl?: string;
  logoDarkUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCss?: string;
  showLogoOnScoreboard: boolean;
  showSponsorLogo: boolean;
  sponsorLogoUrl?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  presetTheme?: string;
}

export interface BrandingContextValue {
  branding: BrandingConfig;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
  applyPreset: (presetId: string) => void;
  cssVariables: Record<string, string>;
  isLoading: boolean;
}

// ==========================================
// DEFAULTS
// ==========================================

export const DEFAULT_BRANDING: BrandingConfig = {
  logoUrl: undefined,
  logoDarkUrl: undefined,
  primaryColor: "#3b82f6",
  secondaryColor: "#1e40af",
  accentColor: "#60a5fa",
  fontFamily: "space_grotesk",
  customCss: undefined,
  showLogoOnScoreboard: true,
  showSponsorLogo: false,
  sponsorLogoUrl: undefined,
  website: undefined,
  twitter: undefined,
  instagram: undefined,
  facebook: undefined,
  presetTheme: "default",
};

// ==========================================
// FONT CONFIGURATIONS
// ==========================================

export const FONTS = {
  space_grotesk: {
    name: "Space Grotesk",
    family: "'Space Grotesk', sans-serif",
    weights: [300, 400, 500, 600, 700],
    category: "Display",
  },
  inter: {
    name: "Inter",
    family: "'Inter', sans-serif",
    weights: [300, 400, 500, 600, 700, 800, 900],
    category: "Sans-serif",
  },
  plus_jakarta: {
    name: "Plus Jakarta Sans",
    family: "'Plus Jakarta Sans', sans-serif",
    weights: [400, 500, 600, 700, 800],
    category: "Sans-serif",
  },
  roboto: {
    name: "Roboto",
    family: "'Roboto', sans-serif",
    weights: [300, 400, 500, 700, 900],
    category: "Sans-serif",
  },
  poppins: {
    name: "Poppins",
    family: "'Poppins', sans-serif",
    weights: [300, 400, 500, 600, 700, 800, 900],
    category: "Display",
  },
} as const;

export type FontId = keyof typeof FONTS;

// ==========================================
// PRESET THEMES
// ==========================================

export interface PresetTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: FontId;
  preview?: string;
}

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: "default",
    name: "Scorr Blue",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    accentColor: "#60a5fa",
    fontFamily: "space_grotesk",
  },
  {
    id: "sports_red",
    name: "Sports Red",
    primaryColor: "#ef4444",
    secondaryColor: "#b91c1c",
    accentColor: "#f87171",
    fontFamily: "space_grotesk",
  },
  {
    id: "nature_green",
    name: "Nature Green",
    primaryColor: "#22c55e",
    secondaryColor: "#15803d",
    accentColor: "#4ade80",
    fontFamily: "inter",
  },
  {
    id: "sunset_orange",
    name: "Sunset Orange",
    primaryColor: "#f97316",
    secondaryColor: "#c2410c",
    accentColor: "#fb923c",
    fontFamily: "plus_jakarta",
  },
  {
    id: "professional_dark",
    name: "Professional Dark",
    primaryColor: "#6366f1",
    secondaryColor: "#4338ca",
    accentColor: "#818cf8",
    fontFamily: "inter",
  },
  {
    id: "light_minimal",
    name: "Light Minimal",
    primaryColor: "#18181b",
    secondaryColor: "#3f3f46",
    accentColor: "#71717a",
    fontFamily: "inter",
  },
  {
    id: "vibrant_purple",
    name: "Vibrant Purple",
    primaryColor: "#a855f7",
    secondaryColor: "#7e22ce",
    accentColor: "#c084fc",
    fontFamily: "space_grotesk",
  },
  {
    id: "ocean_teal",
    name: "Ocean Teal",
    primaryColor: "#14b8a6",
    secondaryColor: "#0f766e",
    accentColor: "#2dd4bf",
    fontFamily: "plus_jakarta",
  },
  {
    id: "golden_premium",
    name: "Golden Premium",
    primaryColor: "#eab308",
    secondaryColor: "#a16207",
    accentColor: "#facc15",
    fontFamily: "space_grotesk",
  },
  {
    id: "electric_pink",
    name: "Electric Pink",
    primaryColor: "#ec4899",
    secondaryColor: "#be185d",
    accentColor: "#f472b6",
    fontFamily: "plus_jakarta",
  },
];

// ==========================================
// CONTEXT
// ==========================================

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export function useBranding(): BrandingContextValue {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}

// ==========================================
// PROVIDER
// ==========================================

interface BrandingProviderProps {
  children: ReactNode;
  initialBranding?: Partial<BrandingConfig>;
  tenantId?: string;
  onUpdate?: (branding: BrandingConfig) => void | Promise<void>;
  onReset?: () => void | Promise<void>;
  onApplyPreset?: (presetId: string) => void | Promise<void>;
}

export function BrandingProvider({
  children,
  initialBranding,
  tenantId,
  onUpdate,
  onReset,
  onApplyPreset,
}: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingConfig>({
    ...DEFAULT_BRANDING,
    ...initialBranding,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Generate CSS variables
  const cssVariables = generateCSSVariables(branding);

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply custom CSS if provided
    let customStyleElement: HTMLStyleElement | null = null;
    if (branding.customCss) {
      customStyleElement = document.createElement("style");
      customStyleElement.id = "brand-custom-css";
      customStyleElement.textContent = branding.customCss;
      document.head.appendChild(customStyleElement);
    }

    return () => {
      // Clean up custom CSS on unmount or change
      if (customStyleElement) {
        customStyleElement.remove();
      }
    };
  }, [cssVariables, branding.customCss]);

  // Load font if needed
  useEffect(() => {
    const font = FONTS[branding.fontFamily as FontId];
    if (font) {
      loadFont(branding.fontFamily as FontId);
    }
  }, [branding.fontFamily]);

  const updateBranding = async (updates: Partial<BrandingConfig>) => {
    setIsLoading(true);
    try {
      const newBranding = { ...branding, ...updates };
      setBranding(newBranding);
      if (onUpdate) {
        await onUpdate(newBranding);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetBranding = async () => {
    setIsLoading(true);
    try {
      setBranding(DEFAULT_BRANDING);
      if (onReset) {
        await onReset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = async (presetId: string) => {
    const preset = PRESET_THEMES.find((p) => p.id === presetId);
    if (!preset) return;

    setIsLoading(true);
    try {
      const newBranding: BrandingConfig = {
        ...branding,
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        accentColor: preset.accentColor,
        fontFamily: preset.fontFamily,
        presetTheme: presetId,
      };
      setBranding(newBranding);
      if (onApplyPreset) {
        await onApplyPreset(presetId);
      } else if (onUpdate) {
        await onUpdate(newBranding);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        updateBranding,
        resetBranding,
        applyPreset,
        cssVariables,
        isLoading,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

// ==========================================
// UTILITIES
// ==========================================

export function generateCSSVariables(branding: BrandingConfig): Record<string, string> {
  const font = FONTS[branding.fontFamily as FontId] || FONTS.space_grotesk;
  
  return {
    "--brand-primary": branding.primaryColor,
    "--brand-secondary": branding.secondaryColor,
    "--brand-accent": branding.accentColor,
    "--brand-font": font.family,
    "--brand-radius": "0.5rem",
    // HSL variants for opacity support
    "--brand-primary-h": hexToHSL(branding.primaryColor).h.toString(),
    "--brand-primary-s": hexToHSL(branding.primaryColor).s.toString() + "%",
    "--brand-primary-l": hexToHSL(branding.primaryColor).l.toString() + "%",
    "--brand-secondary-h": hexToHSL(branding.secondaryColor).h.toString(),
    "--brand-secondary-s": hexToHSL(branding.secondaryColor).s.toString() + "%",
    "--brand-secondary-l": hexToHSL(branding.secondaryColor).l.toString() + "%",
    "--brand-accent-h": hexToHSL(branding.accentColor).h.toString(),
    "--brand-accent-s": hexToHSL(branding.accentColor).s.toString() + "%",
    "--brand-accent-l": hexToHSL(branding.accentColor).l.toString() + "%",
  };
}

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace("#", "");
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Load Google Font
export function loadFont(fontId: FontId): void {
  const font = FONTS[fontId];
  if (!font) return;
  
  const fontName = font.name.replace(/\s+/g, "+");
  const weights = font.weights.join(";");
  const url = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weights}&display=swap`;
  
  // Check if already loaded
  const existingLink = document.querySelector(`link[href="${url}"]`);
  if (existingLink) return;
  
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

// Color contrast checker (WCAG)
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

// Lighten/darken color
export function adjustColorLightness(hex: string, percent: number): string {
  const hsl = hexToHSL(hex);
  hsl.l = Math.min(100, Math.max(0, hsl.l + percent));
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

// Generate color palette from primary color
export function generateColorPalette(primaryColor: string): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
} {
  const hsl = hexToHSL(primaryColor);
  
  return {
    50: hslToHex(hsl.h, hsl.s, 95),
    100: hslToHex(hsl.h, hsl.s, 90),
    200: hslToHex(hsl.h, hsl.s, 80),
    300: hslToHex(hsl.h, hsl.s, 70),
    400: hslToHex(hsl.h, hsl.s, 60),
    500: primaryColor,
    600: hslToHex(hsl.h, hsl.s, 40),
    700: hslToHex(hsl.h, hsl.s, 30),
    800: hslToHex(hsl.h, hsl.s, 20),
    900: hslToHex(hsl.h, hsl.s, 10),
  };
}
