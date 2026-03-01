"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Badge,
  Card,
  CardContent,
} from "@/components/ui";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (players: ImportPlayer[]) => Promise<ImportResult>;
  tenantId: string;
}

interface ImportPlayer {
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  rating?: number;
  ratingSystem?: string;
  tags?: string[];
}

interface ImportResult {
  created: string[];
  skipped: { name: string; reason: string }[];
  errors: { name: string; error: string }[];
}

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "result";

const REQUIRED_FIELDS = ["name"];
const OPTIONAL_FIELDS = ["email", "phone", "dateOfBirth", "gender", "rating", "ratingSystem", "tags"];

export function PlayerImportDialog({
  open,
  onOpenChange,
  onImport,
  tenantId,
}: PlayerImportDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<ImportPlayer[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showSkipped, setShowSkipped] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Parse file
    try {
      const text = await selectedFile.text();
      
      if (selectedFile.name.endsWith(".csv")) {
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          const row: Record<string, string> = {};
          headers.forEach((header, i) => {
            row[header] = values[i] || "";
          });
          return row;
        });
        setRawData(rows);
        autoMapColumns(headers);
      } else if (selectedFile.name.endsWith(".json")) {
        const json = JSON.parse(text);
        const rows = Array.isArray(json) ? json : [json];
        setRawData(rows);
        autoMapColumns(Object.keys(rows[0] || {}));
      }

      setStep("mapping");
    } catch (error) {
      console.error("Failed to parse file:", error);
    }
  };

  const autoMapColumns = (headers: string[]) => {
    const mapping: Record<string, string> = {};
    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes("name")) mapping["name"] = header;
      else if (lowerHeader.includes("email")) mapping["email"] = header;
      else if (lowerHeader.includes("phone")) mapping["phone"] = header;
      else if (lowerHeader.includes("birth") || lowerHeader.includes("dob")) mapping["dateOfBirth"] = header;
      else if (lowerHeader.includes("gender")) mapping["gender"] = header;
      else if (lowerHeader.includes("rating")) mapping["rating"] = header;
      else if (lowerHeader.includes("system")) mapping["ratingSystem"] = header;
      else if (lowerHeader.includes("tag")) mapping["tags"] = header;
    });
    setColumnMapping(mapping);
  };

  const handleMappingChange = (field: string, column: string) => {
    setColumnMapping({ ...columnMapping, [field]: column });
  };

  const handlePreview = () => {
    const players: ImportPlayer[] = [];
    const errors: Record<number, string[]> = {};

    rawData.forEach((row, index) => {
      const player: ImportPlayer = {
        name: row[columnMapping["name"]] || "",
        email: row[columnMapping["email"]] || undefined,
        phone: row[columnMapping["phone"]] || undefined,
        dateOfBirth: row[columnMapping["dateOfBirth"]] || undefined,
        gender: row[columnMapping["gender"]] || undefined,
        rating: row[columnMapping["rating"]] 
          ? parseFloat(row[columnMapping["rating"]]) 
          : undefined,
        ratingSystem: row[columnMapping["ratingSystem"]] || undefined,
        tags: row[columnMapping["tags"]] 
          ? row[columnMapping["tags"]].split(/[;,]/).map((t) => t.trim())
          : undefined,
      };

      const rowErrors: string[] = [];
      if (!player.name) {
        rowErrors.push("Name is required");
      }
      if (player.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player.email)) {
        rowErrors.push("Invalid email format");
      }

      players.push(player);
      if (rowErrors.length > 0) {
        errors[index] = rowErrors;
      }
    });

    setPreviewData(players);
    setValidationErrors(errors);
    setStep("preview");
  };

  const handleImport = async () => {
    setStep("importing");
    
    // Filter out rows with errors
    const validPlayers = previewData.filter((_, index) => !validationErrors[index]);

    try {
      const result = await onImport(validPlayers);
      setImportResult(result);
      setStep("result");
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setRawData([]);
    setColumnMapping({});
    setPreviewData([]);
    setValidationErrors({});
    setImportResult(null);
    setShowSkipped(false);
    setShowErrors(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const csv = "name,email,phone,dateOfBirth,gender,rating,ratingSystem,tags\n" +
      "John Doe,john@example.com,+1 (555) 123-4567,1990-01-15,Male,4.5,dupr,Pro;Singles";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "player-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import Players"}
            {step === "mapping" && "Map Columns"}
            {step === "preview" && "Preview Import"}
            {step === "importing" && "Importing..."}
            {step === "result" && "Import Complete"}
          </DialogTitle>
        </DialogHeader>

        {/* Upload Step */}
        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium mb-2">Upload CSV or JSON file</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Expected format:</p>
              <code className="text-xs text-muted-foreground block">
                name,email,phone,dateOfBirth,gender,rating,ratingSystem,tags
              </code>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Mapping Step */}
        {step === "mapping" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              {file?.name} ({rawData.length} rows)
            </div>

            <div className="space-y-3">
              <Label>Map your columns to player fields</Label>
              {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map((field) => (
                <div key={field} className="flex items-center gap-4">
                  <div className="w-32">
                    <Label className="flex items-center gap-1">
                      {field}
                      {REQUIRED_FIELDS.includes(field) && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                  </div>
                  <select
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3"
                    value={columnMapping[field] || ""}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                  >
                    <option value="">-- Select column --</option>
                    {Object.keys(rawData[0] || {}).map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button 
                onClick={handlePreview}
                disabled={!columnMapping["name"]}
              >
                Preview
              </Button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === "preview" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {previewData.length} players ready to import
              </p>
              {Object.keys(validationErrors).length > 0 && (
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {Object.keys(validationErrors).length} with errors
                </Badge>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {previewData.slice(0, 10).map((player, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    validationErrors[index] 
                      ? 'border-yellow-500/30 bg-yellow-500/5' 
                      : 'border-border'
                  }`}
                >
                  <div>
                    <p className="font-medium">{player.name || "Missing name"}</p>
                    <p className="text-sm text-muted-foreground">{player.email}</p>
                  </div>
                  {validationErrors[index] ? (
                    <div className="text-xs text-yellow-500">
                      {validationErrors[index].join(", ")}
                    </div>
                  ) : (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
              {previewData.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{previewData.length - 10} more
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import {previewData.length - Object.keys(validationErrors).length} Players
              </Button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === "importing" && (
          <div className="py-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent"
            />
            <p>Importing players...</p>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && importResult && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-2xl font-bold text-green-500">
                  {importResult.created.length}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-2xl font-bold text-yellow-500">
                  {importResult.skipped.length}
                </p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-2xl font-bold text-red-500">
                  {importResult.errors.length}
                </p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>

            {/* Skipped */}
            {importResult.skipped.length > 0 && (
              <div>
                <button
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setShowSkipped(!showSkipped)}
                >
                  Skipped ({importResult.skipped.length})
                  {showSkipped ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showSkipped && (
                  <div className="mt-2 space-y-1">
                    {importResult.skipped.map((item, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        {item.name}: {item.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div>
                <button
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setShowErrors(!showErrors)}
                >
                  Errors ({importResult.errors.length})
                  {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showErrors && (
                  <div className="mt-2 space-y-1">
                    {importResult.errors.map((item, i) => (
                      <div key={i} className="text-sm text-red-500">
                        {item.name}: {item.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
