"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  Video, 
  VideoOff, 
  Users, 
  Youtube, 
  Twitch,
  Facebook,
  ExternalLink
} from "lucide-react";

// Stream Status Badge
interface StreamStatusBadgeProps {
  isLive: boolean;
  platform?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StreamStatusBadge({
  isLive,
  platform,
  size = "md",
  className,
}: StreamStatusBadgeProps) {
  const PlatformIcon = getPlatformIcon(platform);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {isLive ? (
        <Badge
          className={cn(
            "bg-red-500 hover:bg-red-600 text-white font-semibold gap-1.5",
            size === "sm" && "text-[10px] px-2 py-0.5",
            size === "md" && "text-xs px-2.5 py-1",
            size === "lg" && "text-sm px-3 py-1.5"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          LIVE
          {PlatformIcon && <PlatformIcon className="w-3 h-3" />}
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className={cn(
            "text-muted-foreground gap-1.5",
            size === "sm" && "text-[10px] px-2 py-0.5",
            size === "md" && "text-xs px-2.5 py-1",
            size === "lg" && "text-sm px-3 py-1.5"
          )}
        >
          <VideoOff className="w-3 h-3" />
          Offline
          {PlatformIcon && <PlatformIcon className="w-3 h-3 opacity-50" />}
        </Badge>
      )}
    </motion.div>
  );
}

// Viewer Count
interface ViewerCountProps {
  count: number;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

export function ViewerCount({
  count,
  showIcon = true,
  animated = true,
  className,
}: ViewerCountProps) {
  const formatCount = (n: number): string => {
    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(1)}M`;
    }
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}K`;
    }
    return String(n);
  };

  return (
    <motion.div
      initial={animated ? { scale: 0.9, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20",
        className
      )}
    >
      {showIcon && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      <Users className="w-3.5 h-3.5 text-red-500" />
      <motion.span
        key={count}
        initial={animated ? { y: -10, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        className="text-sm font-semibold text-red-500 tabular-nums font-display"
      >
        {formatCount(count)}
      </motion.span>
      <span className="text-xs text-red-400">watching</span>
    </motion.div>
  );
}

// Stream Platform Button
interface StreamPlatformButtonProps {
  platform: string;
  streamUrl?: string;
  isLive: boolean;
  onConnect?: () => void;
  className?: string;
}

export function StreamPlatformButton({
  platform,
  streamUrl,
  isLive,
  onConnect,
  className,
}: StreamPlatformButtonProps) {
  const PlatformIcon = getPlatformIcon(platform);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={streamUrl ? () => window.open(streamUrl, "_blank") : onConnect}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
        isLive
          ? "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
          : "bg-muted border border-border text-muted-foreground hover:bg-muted/80",
        className
      )}
    >
      {PlatformIcon && <PlatformIcon className="w-4 h-4" />}
      <span className="text-sm font-medium font-display capitalize">
        {platform}
      </span>
      {streamUrl && <ExternalLink className="w-3 h-3 ml-auto opacity-50" />}
    </motion.button>
  );
}

// Stream Duration
interface StreamDurationProps {
  startedAt: string;
  className?: string;
}

export function StreamDuration({ startedAt, className }: StreamDurationProps) {
  const [duration, setDuration] = useState("00:00:00");

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setDuration(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <span className={cn("text-sm font-mono text-muted-foreground", className)}>
      {duration}
    </span>
  );
}

// Helper function to get platform icon
function getPlatformIcon(platform?: string) {
  switch (platform?.toLowerCase()) {
    case "youtube":
      return Youtube;
    case "twitch":
      return Twitch;
    case "facebook":
      return Facebook;
    default:
      return Radio;
  }
}

// Import useState and useEffect for StreamDuration
import { useState, useEffect } from "react";

export default StreamStatusBadge;
