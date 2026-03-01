"use client";

import { useState, useEffect } from "react";
import { Label, Button, Badge } from "@/components/ui";
import { Check, Type, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FONTS, FontId, loadFont } from "@/lib/theme";

interface FontSelectorProps {
  value: FontId;
  onChange: (fontId: FontId) => void;
  showPreview?: boolean;
  previewText?: string;
}

const FONT_CATEGORIES = ["Display", "Sans-serif"] as const;

export function FontSelector({
  value,
  onChange,
  showPreview = true,
  previewText = "The quick brown fox jumps over the lazy dog",
}: FontSelectorProps) {
  const [loadedFonts, setLoadedFonts] = useState<Set<FontId>>(new Set([value]));
  const [hoveredFont, setHoveredFont] = useState<FontId | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Load font on hover
  useEffect(() => {
    if (hoveredFont && !loadedFonts.has(hoveredFont)) {
      loadFont(hoveredFont);
      setLoadedFonts((prev) => new Set(prev).add(hoveredFont));
    }
  }, [hoveredFont, loadedFonts]);

  // Group fonts by category
  const fontsByCategory = Object.entries(FONTS).reduce((acc, [id, font]) => {
    const category = font.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id: id as FontId, name: font.name, family: font.family, weights: [...font.weights] as number[], category: font.category });
    return acc;
  }, {} as Record<string, Array<{ id: FontId; name: string; family: string; weights: number[]; category: string }>>);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Font Family</Label>

      {/* Font categories and options */}
      <div className="space-y-3">
        {FONT_CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            {/* Category header */}
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === category ? null : category
              )}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {category}
              </span>
              <motion.span
                animate={{ rotate: expandedCategory === category ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg 
                  className="w-4 h-4 text-muted-foreground" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.span>
            </button>

            {/* Font options in category */}
            <AnimatePresence>
              {(expandedCategory === category || expandedCategory === null) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-2 pl-2">
                    {fontsByCategory[category]?.map((font) => (
                      <motion.button
                        key={font.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChange(font.id)}
                        onMouseEnter={() => setHoveredFont(font.id)}
                        onMouseLeave={() => setHoveredFont(null)}
                        className={`
                          relative flex items-center gap-3 p-3 rounded-lg border-2
                          transition-all duration-200 text-left
                          ${value === font.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        {/* Font preview */}
                        <div 
                          className="flex-1"
                          style={{ fontFamily: loadedFonts.has(font.id) ? font.family : undefined }}
                        >
                          <p className="font-semibold text-lg">{font.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {previewText.substring(0, 30)}...
                          </p>
                        </div>

                        {/* Selected indicator */}
                        {value === font.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </motion.div>
                        )}

                        {/* Weights badge */}
                        <div className="flex gap-1 flex-wrap">
                          {font.weights.slice(0, 4).map((weight) => (
                            <Badge 
                              key={weight} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {weight}
                            </Badge>
                          ))}
                          {font.weights.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{font.weights.length - 4}
                            </Badge>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Preview section */}
      {showPreview && (
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs text-muted-foreground">Preview</Label>
          </div>
          
          <div 
            className="space-y-3"
            style={{ fontFamily: loadedFonts.has(value) ? FONTS[value].family : undefined }}
          >
            <p className="text-4xl font-bold">{previewText.split(" ")[0]}</p>
            <p className="text-xl font-semibold">{previewText}</p>
            <p className="text-base">{previewText}</p>
            <p className="text-sm text-muted-foreground">{previewText}</p>
            
            {/* Weights preview */}
            <div className="flex gap-4 flex-wrap pt-2 border-t border-border mt-3">
              <span style={{ fontWeight: 300 }} className="text-sm">Light</span>
              <span style={{ fontWeight: 400 }} className="text-sm">Regular</span>
              <span style={{ fontWeight: 500 }} className="text-sm">Medium</span>
              <span style={{ fontWeight: 600 }} className="text-sm">Semibold</span>
              <span style={{ fontWeight: 700 }} className="text-sm">Bold</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
