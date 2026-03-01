"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input, 
  Label,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Switch,
} from "@/components/ui";
import { 
  Palette, 
  Type, 
  Image, 
  Code, 
  Globe, 
  Save, 
  RotateCcw,
  Sparkles,
  Monitor,
  Eye,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPicker } from "@/components/branding/ColorPicker";
import { LogoUploader } from "@/components/branding/LogoUploader";
import { FontSelector } from "@/components/branding/FontSelector";
import { 
  BrandingConfig, 
  DEFAULT_BRANDING, 
  PRESET_THEMES, 
  FontId,
  loadFont 
} from "@/lib/theme";

// Mock tenant ID - in production this would come from auth
const MOCK_TENANT_ID = "tenant_123";

export default function BrandingSettingsPage() {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [previewMode, setPreviewMode] = useState<"scoreboard" | "registration" | "share">("scoreboard");

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [branding]);

  // Handle branding updates
  const updateBranding = useCallback((updates: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...updates }));
  }, []);

  // Save branding
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, call Convex mutation
      // await updateBranding({ tenantId: MOCK_TENANT_ID, branding });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setBranding(DEFAULT_BRANDING);
  };

  // Apply preset theme
  const applyPreset = (presetId: string) => {
    const preset = PRESET_THEMES.find((p) => p.id === presetId);
    if (preset) {
      setBranding((prev) => ({
        ...prev,
        primaryColor: preset.primaryColor!,
        secondaryColor: preset.secondaryColor!,
        accentColor: preset.accentColor!,
        fontFamily: preset.fontFamily!,
        presetTheme: presetId,
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Branding Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize the look and feel of your scoreboard and public pages
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Colors</span>
              </TabsTrigger>
              <TabsTrigger value="fonts" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Fonts</span>
              </TabsTrigger>
              <TabsTrigger value="logo" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className="hidden sm:inline">Logo</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Social</span>
              </TabsTrigger>
              <TabsTrigger value="css" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">CSS</span>
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="mt-6 space-y-6">
              {/* Preset Themes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Preset Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESET_THEMES.map((preset) => (
                      <motion.button
                        key={preset.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applyPreset(preset.id)}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all text-left
                          ${branding.presetTheme === preset.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        {/* Color preview */}
                        <div className="flex gap-1 mb-2">
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.primaryColor }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.secondaryColor }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                        </div>
                        <p className="font-medium text-sm">{preset.name}</p>
                        {branding.presetTheme === preset.id && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ColorPicker
                    label="Primary Color"
                    value={branding.primaryColor}
                    onChange={(color) => updateBranding({ primaryColor: color })}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={branding.secondaryColor}
                    onChange={(color) => updateBranding({ secondaryColor: color })}
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={branding.accentColor}
                    onChange={(color) => updateBranding({ accentColor: color })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fonts Tab */}
            <TabsContent value="fonts" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <FontSelector
                    value={branding.fontFamily as FontId}
                    onChange={(font) => updateBranding({ fontFamily: font })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logo Tab */}
            <TabsContent value="logo" className="mt-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <LogoUploader
                    logoUrl={branding.logoUrl}
                    logoDarkUrl={branding.logoDarkUrl}
                    onLogoChange={(url, isDark) => 
                      isDark 
                        ? updateBranding({ logoDarkUrl: url })
                        : updateBranding({ logoUrl: url })
                    }
                    onLogoRemove={(isDark) =>
                      isDark
                        ? updateBranding({ logoDarkUrl: undefined })
                        : updateBranding({ logoUrl: undefined })
                    }
                    showDarkVariant={true}
                  />

                  {/* Display options */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show logo on scoreboard</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your logo on the live scoreboard
                        </p>
                      </div>
                      <Switch
                        checked={branding.showLogoOnScoreboard}
                        onCheckedChange={(checked) => 
                          updateBranding({ showLogoOnScoreboard: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show sponsor logo</Label>
                        <p className="text-sm text-muted-foreground">
                          Display a sponsor logo on your broadcasts
                        </p>
                      </div>
                      <Switch
                        checked={branding.showSponsorLogo}
                        onCheckedChange={(checked) =>
                          updateBranding({ showSponsorLogo: checked })
                        }
                      />
                    </div>

                    {branding.showSponsorLogo && (
                      <div className="pl-4 border-l-2 border-primary/30">
                        <Label>Sponsor Logo URL</Label>
                        <Input
                          value={branding.sponsorLogoUrl || ""}
                          onChange={(e) =>
                            updateBranding({ sponsorLogoUrl: e.target.value })
                          }
                          placeholder="https://example.com/sponsor.png"
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={branding.website || ""}
                      onChange={(e) => updateBranding({ website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Twitter / X</Label>
                    <Input
                      value={branding.twitter || ""}
                      onChange={(e) => updateBranding({ twitter: e.target.value })}
                      placeholder="@yourhandle"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={branding.instagram || ""}
                      onChange={(e) => updateBranding({ instagram: e.target.value })}
                      placeholder="@yourhandle"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      value={branding.facebook || ""}
                      onChange={(e) => updateBranding({ facebook: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CSS Tab */}
            <TabsContent value="css" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom CSS</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add custom CSS to further customize the appearance
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={branding.customCss || ""}
                    onChange={(e) => updateBranding({ customCss: e.target.value })}
                    placeholder={`/* Custom CSS */
.scoreboard {
  /* Your custom styles */
}

.team-name {
  /* Style team names */
}`}
                    className="font-mono text-sm min-h-[200px]"
                  />
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>💡 Available CSS variables:</p>
                    <code className="block p-2 bg-muted rounded text-xs">
                      --brand-primary, --brand-secondary, --brand-accent, --brand-font, --brand-radius
                    </code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
              <div className="flex gap-1">
                {(["scoreboard", "registration", "share"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={previewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewMode(mode)}
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
                <PreviewContent 
                  branding={branding} 
                  mode={previewMode}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Preview component that shows branding in action
function PreviewContent({ 
  branding, 
  mode 
}: { 
  branding: BrandingConfig; 
  mode: "scoreboard" | "registration" | "share" 
}) {
  const font = branding.fontFamily || "space_grotesk";
  
  return (
    <div 
      className="aspect-video bg-[#0a0a0a] p-4"
      style={{ 
        fontFamily: `var(--brand-font, '${font}', sans-serif)`,
        ["--brand-primary" as string]: branding.primaryColor,
        ["--brand-secondary" as string]: branding.secondaryColor,
        ["--brand-accent" as string]: branding.accentColor,
      }}
    >
      {mode === "scoreboard" && (
        <ScoreboardPreview branding={branding} />
      )}
      {mode === "registration" && (
        <RegistrationPreview branding={branding} />
      )}
      {mode === "share" && (
        <SharePreview branding={branding} />
      )}
    </div>
  );
}

function ScoreboardPreview({ branding }: { branding: BrandingConfig }) {
  return (
    <div className="h-full flex flex-col justify-center">
      {/* Header with logo */}
      <div className="flex items-center justify-between mb-4">
        {branding.showLogoOnScoreboard && branding.logoUrl ? (
          <img src={branding.logoUrl} alt="Logo" className="h-6 object-contain" />
        ) : (
          <div 
            className="text-sm font-bold tracking-wider"
            style={{ color: branding.primaryColor }}
          >
            YOUR ORG
          </div>
        )}
        <div 
          className="px-2 py-1 rounded text-xs font-bold animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        >
          LIVE
        </div>
      </div>

      {/* Score display */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-1">HOME</p>
          <p 
            className="text-5xl font-bold"
            style={{ color: branding.primaryColor }}
          >
            24
          </p>
        </div>
        <div className="text-2xl text-gray-500">VS</div>
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-1">AWAY</p>
          <p 
            className="text-5xl font-bold"
            style={{ color: branding.accentColor }}
          >
            21
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
        <span>4th Quarter • 2:34</span>
        {branding.showSponsorLogo && (
          <span className="opacity-50">Presented by Sponsor</span>
        )}
      </div>
    </div>
  );
}

function RegistrationPreview({ branding }: { branding: BrandingConfig }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div 
        className="p-3 mb-4 rounded-lg"
        style={{ backgroundColor: branding.primaryColor + "20" }}
      >
        <h3 
          className="text-lg font-bold"
          style={{ color: branding.primaryColor }}
        >
          Tournament Registration
        </h3>
        <p className="text-xs text-gray-400">Join the competition</p>
      </div>

      {/* Form fields */}
      <div className="space-y-2 flex-1">
        <div className="p-2 bg-white/5 rounded border border-white/10 text-sm">
          Player Name
        </div>
        <div className="p-2 bg-white/5 rounded border border-white/10 text-sm">
          Email
        </div>
        <div className="p-2 bg-white/5 rounded border border-white/10 text-sm">
          Division
        </div>
      </div>

      {/* Button */}
      <button
        className="w-full py-2 rounded-lg font-semibold mt-4 text-sm"
        style={{ backgroundColor: branding.primaryColor }}
      >
        Register Now
      </button>
    </div>
  );
}

function SharePreview({ branding }: { branding: BrandingConfig }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      {/* Logo */}
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: branding.primaryColor + "30" }}
      >
        {branding.logoUrl ? (
          <img src={branding.logoUrl} alt="" className="w-10 h-10 object-contain" />
        ) : (
          <span 
            className="text-2xl font-bold"
            style={{ color: branding.primaryColor }}
          >
            T
          </span>
        )}
      </div>

      <h3 
        className="text-lg font-bold mb-1"
        style={{ color: branding.primaryColor }}
      >
        Championship Finals
      </h3>
      <p className="text-xs text-gray-400 mb-4">Final Score</p>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-400">Team A</p>
          <p 
            className="text-3xl font-bold"
            style={{ color: branding.primaryColor }}
          >
            3
          </p>
        </div>
        <div className="text-gray-500">-</div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Team B</p>
          <p 
            className="text-3xl font-bold"
            style={{ color: branding.accentColor }}
          >
            1
          </p>
        </div>
      </div>

      {/* Social icons */}
      <div className="flex gap-2 mt-4">
        {branding.twitter && (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: branding.primaryColor + "30" }}
          >
            <span className="text-xs">𝕏</span>
          </div>
        )}
        {branding.instagram && (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: branding.primaryColor + "30" }}
          >
            <span className="text-xs">📸</span>
          </div>
        )}
      </div>
    </div>
  );
}
