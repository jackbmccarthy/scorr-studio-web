// Convex functions for tenant branding

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// DEFAULT BRANDING
// ==========================================

export const DEFAULT_BRANDING = {
  logoUrl: undefined,
  logoDarkUrl: undefined,
  primaryColor: "#3b82f6", // Scorr blue
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
// PRESET THEMES
// ==========================================

export const PRESET_THEMES = {
  default: {
    name: "Scorr Blue",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    accentColor: "#60a5fa",
    fontFamily: "space_grotesk",
  },
  sports_red: {
    name: "Sports Red",
    primaryColor: "#ef4444",
    secondaryColor: "#b91c1c",
    accentColor: "#f87171",
    fontFamily: "space_grotesk",
  },
  nature_green: {
    name: "Nature Green",
    primaryColor: "#22c55e",
    secondaryColor: "#15803d",
    accentColor: "#4ade80",
    fontFamily: "inter",
  },
  sunset_orange: {
    name: "Sunset Orange",
    primaryColor: "#f97316",
    secondaryColor: "#c2410c",
    accentColor: "#fb923c",
    fontFamily: "plus_jakarta",
  },
  professional_dark: {
    name: "Professional Dark",
    primaryColor: "#6366f1",
    secondaryColor: "#4338ca",
    accentColor: "#818cf8",
    fontFamily: "inter",
  },
  light_minimal: {
    name: "Light Minimal",
    primaryColor: "#18181b",
    secondaryColor: "#3f3f46",
    accentColor: "#71717a",
    fontFamily: "inter",
  },
  vibrant_purple: {
    name: "Vibrant Purple",
    primaryColor: "#a855f7",
    secondaryColor: "#7e22ce",
    accentColor: "#c084fc",
    fontFamily: "space_grotesk",
  },
  ocean_teal: {
    name: "Ocean Teal",
    primaryColor: "#14b8a6",
    secondaryColor: "#0f766e",
    accentColor: "#2dd4bf",
    fontFamily: "plus_jakarta",
  },
  golden_premium: {
    name: "Golden Premium",
    primaryColor: "#eab308",
    secondaryColor: "#a16207",
    accentColor: "#facc15",
    fontFamily: "space_grotesk",
  },
  electric_pink: {
    name: "Electric Pink",
    primaryColor: "#ec4899",
    secondaryColor: "#be185d",
    accentColor: "#f472b6",
    fontFamily: "plus_jakarta",
  },
};

// ==========================================
// QUERIES
// ==========================================

/**
 * Get branding for a tenant
 */
export const getBranding = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      return DEFAULT_BRANDING;
    }
    
    // Merge with defaults to ensure all fields are present
    return {
      ...DEFAULT_BRANDING,
      ...tenant.branding,
    };
  },
});

/**
 * Get preset themes
 */
export const getPresetThemes = query({
  args: {},
  handler: async () => {
    return Object.entries(PRESET_THEMES).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  },
});

/**
 * Get branding for public display (by slug)
 */
export const getBrandingBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!tenant) {
      return DEFAULT_BRANDING;
    }
    
    return {
      ...DEFAULT_BRANDING,
      ...tenant.branding,
      tenantName: tenant.name,
    };
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Update branding settings
 */
export const updateBranding = mutation({
  args: {
    tenantId: v.string(),
    branding: v.object({
      logoUrl: v.optional(v.string()),
      logoDarkUrl: v.optional(v.string()),
      primaryColor: v.optional(v.string()),
      secondaryColor: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      fontFamily: v.optional(v.string()),
      customCss: v.optional(v.string()),
      showLogoOnScoreboard: v.optional(v.boolean()),
      showSponsorLogo: v.optional(v.boolean()),
      sponsorLogoUrl: v.optional(v.string()),
      website: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      presetTheme: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    
    // Merge with existing branding
    const currentBranding = tenant.branding || {};
    const newBranding = {
      ...currentBranding,
      ...args.branding,
    };
    
    await ctx.db.patch(tenant._id, {
      branding: newBranding,
    });
    
    return { success: true, branding: newBranding };
  },
});

/**
 * Reset branding to defaults
 */
export const resetBranding = mutation({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    
    await ctx.db.patch(tenant._id, {
      branding: DEFAULT_BRANDING,
    });
    
    return { success: true, branding: DEFAULT_BRANDING };
  },
});

/**
 * Apply a preset theme
 */
export const applyPresetTheme = mutation({
  args: {
    tenantId: v.string(),
    presetId: v.string(),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    
    const preset = PRESET_THEMES[args.presetId as keyof typeof PRESET_THEMES];
    
    if (!preset) {
      throw new Error("Preset theme not found");
    }
    
    const currentBranding = tenant.branding || {};
    const newBranding = {
      ...currentBranding,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      fontFamily: preset.fontFamily,
      presetTheme: args.presetId,
    };
    
    await ctx.db.patch(tenant._id, {
      branding: newBranding,
    });
    
    return { success: true, branding: newBranding };
  },
});

/**
 * Upload logo (stores URL)
 * In production, this would integrate with file storage
 */
export const uploadLogo = mutation({
  args: {
    tenantId: v.string(),
    logoUrl: v.string(),
    isDarkVariant: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    
    const currentBranding = tenant.branding || {};
    
    if (args.isDarkVariant) {
      currentBranding.logoDarkUrl = args.logoUrl;
    } else {
      currentBranding.logoUrl = args.logoUrl;
    }
    
    await ctx.db.patch(tenant._id, {
      branding: currentBranding,
    });
    
    return { success: true, branding: currentBranding };
  },
});

/**
 * Generate CSS variables from branding
 */
export const generateCSSVariables = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    const branding = {
      ...DEFAULT_BRANDING,
      ...(tenant?.branding || {}),
    };
    
    return {
      "--brand-primary": branding.primaryColor,
      "--brand-secondary": branding.secondaryColor,
      "--brand-accent": branding.accentColor,
      "--brand-font": getFontFamily(branding.fontFamily || "space_grotesk"),
      "--brand-radius": "0.5rem",
    };
  },
});

// ==========================================
// HELPERS
// ==========================================

function getFontFamily(fontId: string): string {
  const fonts: Record<string, string> = {
    space_grotesk: "'Space Grotesk', sans-serif",
    inter: "'Inter', sans-serif",
    plus_jakarta: "'Plus Jakarta Sans', sans-serif",
    roboto: "'Roboto', sans-serif",
    poppins: "'Poppins', sans-serif",
  };
  return fonts[fontId] || fonts.space_grotesk;
}
