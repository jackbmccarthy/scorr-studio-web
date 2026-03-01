"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileImage,
  Loader2,
  Check,
  X,
  Clock,
  ExternalLink
} from "lucide-react";

// Export Dialog
interface ExportDialogProps {
  competitionId?: string;
  onExport: (type: string, params: Record<string, unknown>) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function ExportDialog({
  competitionId,
  onExport,
  trigger,
  className,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<string>("pdf_bracket");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportType, { competitionId });
      setOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      value: "pdf_bracket",
      label: "PDF Bracket",
      description: "Visual bracket diagram",
      icon: FileImage,
    },
    {
      value: "csv_data",
      label: "CSV Data",
      description: "Match & team data",
      icon: FileSpreadsheet,
    },
    {
      value: "json_export",
      label: "JSON Export",
      description: "Full data export",
      icon: FileJson,
    },
    {
      value: "report",
      label: "Summary Report",
      description: "Competition summary",
      icon: FileText,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={cn("gap-2", className)}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Export Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Export Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            {exportOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExportType(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  exportType === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <option.icon className={cn(
                  "w-6 h-6",
                  exportType === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium text-sm font-display",
                  exportType === option.value ? "text-primary" : "text-foreground"
                )}>
                  {option.label}
                </span>
                <span className="text-[10px] text-muted-foreground text-center">
                  {option.description}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export Job Status
interface ExportJob {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface ExportJobStatusProps {
  job: ExportJob;
  onDownload?: () => void;
  className?: string;
}

export function ExportJobStatus({
  job,
  onDownload,
  className,
}: ExportJobStatusProps) {
  const statusConfig = getStatusConfig(job.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        statusConfig.borderClass,
        className
      )}
    >
      <div className={cn("p-1.5 rounded-lg", statusConfig.bgClass)}>
        {job.status === "processing" ? (
          <Loader2 className={cn("w-4 h-4 animate-spin", statusConfig.textClass)} />
        ) : (
          <statusConfig.icon className={cn("w-4 h-4", statusConfig.textClass)} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm font-display capitalize">
            {job.type.replace("_", " ")}
          </span>
          <Badge className={cn("text-[10px]", statusConfig.badgeClass)}>
            {job.status}
          </Badge>
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" />
          {new Date(job.createdAt).toLocaleString()}
        </div>
      </div>

      {job.status === "completed" && job.downloadUrl && (
        <Button
          size="sm"
          variant="outline"
          onClick={onDownload}
          className="gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </Button>
      )}

      {job.status === "failed" && job.error && (
        <span className="text-xs text-destructive truncate max-w-[200px]">
          {job.error}
        </span>
      )}
    </motion.div>
  );
}

// Export History List
interface ExportHistoryProps {
  jobs: ExportJob[];
  onDownload?: (job: ExportJob) => void;
  className?: string;
}

export function ExportHistory({
  jobs,
  onDownload,
  className,
}: ExportHistoryProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Export History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No export history
            </div>
          ) : (
            jobs.map((job) => (
              <ExportJobStatus
                key={job.id}
                job={job}
                onDownload={() => onDownload?.(job)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for status configuration
function getStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return {
        icon: Clock,
        textClass: "text-yellow-500",
        bgClass: "bg-yellow-500/10",
        borderClass: "border-yellow-500/30",
        badgeClass: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      };
    case "processing":
      return {
        icon: Loader2,
        textClass: "text-blue-500",
        bgClass: "bg-blue-500/10",
        borderClass: "border-blue-500/30",
        badgeClass: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      };
    case "completed":
      return {
        icon: Check,
        textClass: "text-green-500",
        bgClass: "bg-green-500/10",
        borderClass: "border-green-500/30",
        badgeClass: "bg-green-500/20 text-green-700 dark:text-green-300",
      };
    case "failed":
      return {
        icon: X,
        textClass: "text-red-500",
        bgClass: "bg-red-500/10",
        borderClass: "border-red-500/30",
        badgeClass: "bg-red-500/20 text-red-700 dark:text-red-300",
      };
    default:
      return {
        icon: Clock,
        textClass: "text-muted-foreground",
        bgClass: "bg-muted",
        borderClass: "border-border",
        badgeClass: "bg-muted text-muted-foreground",
      };
  }
}

export default ExportDialog;
