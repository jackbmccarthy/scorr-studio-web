"use client";

import { useState, useCallback, useEffect } from "react";
import { Input, Label, Button, Badge } from "@/components/ui";
import { Check, RefreshCw } from "lucide-react";
import { 
  hexToHSL, 
  hslToHex, 
  meetsWCAGAA, 
  meetsWCAGAAA, 
  generateColorPalette 
} from "@/lib/theme";
import { motion } from "framer-motion";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showAccessibility?: boolean;
  showPalette?: boolean;
  showShades?: boolean;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#fafafa",
];

export function ColorPicker({
  value,
  onChange,
  label,
  showAccessibility = true,
  showPalette = true,
  showShades = true,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);
  const [hsl, setHsl] = useState(hexToHSL(value));

  // Sync hex input with value prop
  useEffect(() => {
    setHexInput(value);
    setHsl(hexToHSL(value));
  }, [value]);

  // Handle hex input change
  const handleHexChange = useCallback((newHex: string) => {
    // Add # if missing
    let formattedHex = newHex;
    if (newHex && !newHex.startsWith("#")) {
      formattedHex = "#" + newHex;
    }

    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(formattedHex)) {
      setHexInput(formattedHex);
      setHsl(hexToHSL(formattedHex));
      onChange(formattedHex);
    } else {
      setHexInput(newHex);
    }
  }, [onChange]);

  // Handle HSL slider changes
  const handleHSLChange = useCallback((type: "h" | "s" | "l", newValue: number) => {
    const newHsl = { ...hsl, [type]: newValue };
    setHsl(newHsl);
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHexInput(newHex);
    onChange(newHex);
  }, [hsl, onChange]);

  // Reset to default
  const handleReset = useCallback(() => {
    setHexInput(value);
    setHsl(hexToHSL(value));
  }, [value]);

  // Generate shades
  const shades = showShades ? generateColorPalette(value) : null;

  // Check contrast against white and black
  const contrastWhite = meetsWCAGAA(value, "#ffffff");
  const contrastBlack = meetsWCAGAA(value, "#000000");

  return (
    <div className="space-y-4">
      {/* Label and hex input */}
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      
      <div className="flex items-center gap-3">
        {/* Color swatch with preview */}
        <div 
          className="w-12 h-12 rounded-lg border-2 border-white/10 cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: hexInput }}
        >
          <input
            type="color"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {/* Hex input */}
        <div className="flex-1">
          <Input
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#000000"
            className="font-mono"
          />
        </div>

        {/* Reset button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title="Reset to original"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* HSL Sliders */}
      <div className="space-y-3 pt-2">
        {/* Hue slider */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hue</Label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="360"
              value={hsl.h}
              onChange={(e) => handleHSLChange("h", parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  hsl(0, ${hsl.s}%, ${hsl.l}%),
                  hsl(60, ${hsl.s}%, ${hsl.l}%),
                  hsl(120, ${hsl.s}%, ${hsl.l}%),
                  hsl(180, ${hsl.s}%, ${hsl.l}%),
                  hsl(240, ${hsl.s}%, ${hsl.l}%),
                  hsl(300, ${hsl.s}%, ${hsl.l}%),
                  hsl(360, ${hsl.s}%, ${hsl.l}%)
                )`,
              }}
            />
          </div>
        </div>

        {/* Saturation slider */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Saturation</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => handleHSLChange("s", parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                hsl(${hsl.h}, 0%, ${hsl.l}%),
                hsl(${hsl.h}, 100%, ${hsl.l}%)
              )`,
            }}
          />
        </div>

        {/* Lightness slider */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Lightness</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => handleHSLChange("l", parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                hsl(${hsl.h}, ${hsl.s}%, 0%),
                hsl(${hsl.h}, ${hsl.s}%, 50%),
                hsl(${hsl.h}, ${hsl.s}%, 100%)
              )`,
            }}
          />
        </div>
      </div>

      {/* Preset colors */}
      {showPalette && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Presets</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleHexChange(color)}
                className="w-7 h-7 rounded-md border-2 border-white/10 relative transition-all"
                style={{ backgroundColor: color }}
              >
                {hexInput === color && (
                  <Check className="w-4 h-4 absolute inset-0 m-auto text-white mix-blend-difference" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Shades */}
      {showShades && shades && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Shades</Label>
          <div className="flex gap-1">
            {Object.entries(shades).map(([key, color]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleHexChange(color)}
                className="flex-1 h-8 rounded-md border-2 border-white/10 relative first:rounded-l-lg last:rounded-r-lg"
                style={{ backgroundColor: color }}
                title={`${key}: ${color}`}
              >
                {hexInput === color && (
                  <Check className="w-4 h-4 absolute inset-0 m-auto text-white mix-blend-difference" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Accessibility check */}
      {showAccessibility && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Accessibility</Label>
          <div className="flex gap-2">
            <Badge 
              variant={contrastWhite ? "default" : "outline"}
              className={contrastWhite ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
            >
              On White: {contrastWhite ? "✓ AA" : "✗ Fail"}
            </Badge>
            <Badge 
              variant={contrastBlack ? "default" : "outline"}
              className={contrastBlack ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
            >
              On Black: {contrastBlack ? "✓ AA" : "✗ Fail"}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
