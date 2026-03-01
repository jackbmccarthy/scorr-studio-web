"use client";

import { useState, useCallback, useRef } from "react";
import { Button, Label, Badge } from "@/components/ui";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Sun, 
  Moon,
  Check,
  ZoomIn,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogoUploaderProps {
  logoUrl?: string;
  logoDarkUrl?: string;
  onLogoChange: (url: string, isDark?: boolean) => void;
  onLogoRemove?: (isDark?: boolean) => void;
  showDarkVariant?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function LogoUploader({
  logoUrl,
  logoDarkUrl,
  onLogoChange,
  onLogoRemove,
  showDarkVariant = true,
  maxSizeMB = 2,
  acceptedFormats = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
}: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLogo = activeTab === "light" ? logoUrl : logoDarkUrl;

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [activeTab]);

  // Handle file input change
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [activeTab]);

  // Process file
  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid format. Accepted: ${acceptedFormats.map(f => f.split("/")[1].toUpperCase()).join(", ")}`);
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // In production, upload to storage (Convex file storage, S3, etc.)
      // For now, use data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onLogoChange(dataUrl, activeTab === "dark");
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Upload failed");
      setIsUploading(false);
    }
  };

  // Handle logo removal
  const handleRemove = () => {
    if (onLogoRemove) {
      onLogoRemove(activeTab === "dark");
    }
  };

  // Trigger file input
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Logo</Label>

      {/* Tab switcher for light/dark variants */}
      {showDarkVariant && (
        <div className="flex gap-2">
          <Button
            variant={activeTab === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("light")}
            className="flex items-center gap-2"
          >
            <Sun className="w-4 h-4" />
            Light Mode
          </Button>
          <Button
            variant={activeTab === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("dark")}
            className="flex items-center gap-2"
          >
            <Moon className="w-4 h-4" />
            Dark Mode
          </Button>
        </div>
      )}

      {/* Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          cursor-pointer transition-all duration-200
          flex flex-col items-center justify-center min-h-[200px]
          ${isDragging 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {currentLogo ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`
                relative rounded-lg overflow-hidden
                ${activeTab === "dark" ? "bg-white p-2" : "bg-muted p-2"}
              `}>
                <img
                  src={currentLogo}
                  alt="Logo preview"
                  className="max-w-[200px] max-h-[120px] object-contain"
                />
                
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {activeTab === "light" ? "Light mode logo" : "Dark mode logo"}
              </Badge>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                {isUploading ? (
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div>
                <p className="font-medium">
                  {isUploading ? "Uploading..." : "Drop your logo here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>

              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>PNG, JPG, SVG, WebP</span>
                <span>•</span>
                <span>Max {maxSizeMB}MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      {/* Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 Recommended: 200x200px for best quality</p>
        <p>💡 Use PNG with transparency for best results</p>
        {showDarkVariant && (
          <p>💡 Upload a dark variant for use on light backgrounds</p>
        )}
      </div>
    </div>
  );
}
