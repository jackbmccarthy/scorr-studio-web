"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  RefreshCw,
  Brain,
  BarChart3,
  Clock
} from "lucide-react";

// AI Commentary Generator
interface CommentaryGeneratorProps {
  matchId: string;
  onGenerate?: () => void;
  className?: string;
}

export function CommentaryGenerator({
  matchId,
  onGenerate,
  className,
}: CommentaryGeneratorProps) {
  const [commentary, setCommentary] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateCommentary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/commentary?matchId=${matchId}&limit=5`);
      const data = await res.json();
      if (data.commentary) {
        setCommentary(data.commentary.map((c: { content: string }) => c.content));
      }
    } catch (error) {
      console.error("Failed to generate commentary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateCommentary();
  }, [matchId]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <CardTitle className="text-base font-display">AI Commentary</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              generateCommentary();
              onGenerate?.();
            }}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence mode="popLayout">
          {commentary.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center py-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse text-purple-400" />
                  Generating commentary...
                </div>
              ) : (
                "No commentary yet. Click refresh to generate."
              )}
            </motion.div>
          ) : (
            commentary.map((text, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-2 p-2 rounded-lg bg-muted/50 border border-border/50"
              >
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{text}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Win Probability Display
interface WinProbabilityProps {
  team1Name: string;
  team2Name: string;
  team1Prob: number;
  team2Prob: number;
  confidence?: number;
  lastUpdated?: string;
  className?: string;
}

export function WinProbability({
  team1Name,
  team2Name,
  team1Prob,
  team2Prob,
  confidence,
  lastUpdated,
  className,
}: WinProbabilityProps) {
  const team1Percent = Math.round(team1Prob * 100);
  const team2Percent = Math.round(team2Prob * 100);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <BarChart3 className="w-4 h-4 text-green-400" />
            </div>
            <CardTitle className="text-base font-display">Win Probability</CardTitle>
          </div>
          {confidence && (
            <Badge variant="outline" className="text-[10px]">
              {Math.round(confidence * 100)}% confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Team Names */}
          <div className="flex justify-between text-sm">
            <span className="font-medium font-display truncate max-w-[45%]">
              {team1Name}
            </span>
            <span className="font-medium font-display truncate max-w-[45%] text-right">
              {team2Name}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 rounded-full overflow-hidden bg-muted flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${team1Percent}%` }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-r from-primary to-primary/80"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${team2Percent}%` }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-l from-red-500 to-red-500/80"
            />
          </div>

          {/* Percentages */}
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-primary tabular-nums font-display">
                {team1Percent}%
              </span>
              {team1Prob > team2Prob && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {team2Prob > team1Prob && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              <span className="text-2xl font-bold text-red-500 tabular-nums font-display">
                {team2Percent}%
              </span>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Highlight Reel
interface Highlight {
  id: string;
  content: string;
  type: string;
  timestamp: string;
  videoUrl?: string;
}

interface HighlightReelProps {
  highlights: Highlight[];
  onGenerate?: () => void;
  className?: string;
}

export function HighlightReel({
  highlights,
  onGenerate,
  className,
}: HighlightReelProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <CardTitle className="text-base font-display">Key Moments</CardTitle>
          </div>
          {onGenerate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsLoading(true);
                onGenerate();
                setTimeout(() => setIsLoading(false), 1000);
              }}
              disabled={isLoading}
              className="h-8 px-2"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {highlights.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No highlights yet
            </div>
          ) : (
            highlights.map((highlight, idx) => (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="mt-0.5">
                  <HighlightTypeIcon type={highlight.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{highlight.content}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(highlight.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {highlight.videoUrl && (
                  <Button size="sm" variant="ghost" className="h-6 px-2">
                    Play
                  </Button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for highlight type icons
function HighlightTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "point":
      return <div className="w-2 h-2 rounded-full bg-primary" />;
    case "game":
      return <Zap className="w-4 h-4 text-yellow-500" />;
    case "set":
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    default:
      return <Sparkles className="w-4 h-4 text-purple-400" />;
  }
}

// Import Trophy icon
import { Trophy } from "lucide-react";

export default CommentaryGenerator;
