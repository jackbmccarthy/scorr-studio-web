"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  GripVertical, 
  Plus, 
  Trash2, 
  RotateCcw,
  Users,
  Settings2,
  ChevronRight
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  seed?: number;
  logoUrl?: string;
}

interface Match {
  id: string;
  roundNumber: number;
  roundName: string;
  matchIndex: number;
  team1?: Team;
  team2?: Team;
  winner?: "team1" | "team2";
  status: "scheduled" | "live" | "finished";
  nextMatchId?: string;
}

interface BracketEditorProps {
  matches: Match[];
  teams: Team[];
  bracketType: "single_elimination" | "double_elimination" | "round_robin" | "swiss";
  onMatchUpdate: (matchId: string, updates: Partial<Match>) => void;
  onRegenerate: () => void;
  onAdvanceTeam: (matchId: string, winnerId: string) => void;
  className?: string;
}

export function BracketEditor({
  matches,
  teams,
  bracketType,
  onMatchUpdate,
  onRegenerate,
  onAdvanceTeam,
  className,
}: BracketEditorProps) {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Group matches by round
  const rounds = matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = match.roundName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  const roundNames = Object.keys(rounds).sort((a, b) => {
    const aIdx = rounds[a][0]?.roundNumber ?? 0;
    const bIdx = rounds[b][0]?.roundNumber ?? 0;
    return aIdx - bIdx;
  });

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display">Bracket Editor</h2>
            <p className="text-sm text-muted-foreground">
              {bracketType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Bracket Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          <AnimatePresence>
            {roundNames.map((roundName, roundIdx) => (
              <motion.div
                key={roundName}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: roundIdx * 0.1 }}
                className="flex flex-col min-w-[280px]"
              >
                {/* Round Header */}
                <div className="mb-4 pb-2 border-b border-border/50">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground font-display">
                    {roundName}
                  </h3>
                </div>

                {/* Matches */}
                <div className="flex flex-col gap-4 flex-1 justify-around">
                  {rounds[roundName].map((match, matchIdx) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: roundIdx * 0.1 + matchIdx * 0.05 }}
                    >
                      <EditableMatchCard
                        match={match}
                        isSelected={selectedMatch === match.id}
                        isDragging={isDragging}
                        onSelect={() => setSelectedMatch(
                          selectedMatch === match.id ? null : match.id
                        )}
                        onAdvance={(winnerId) => onAdvanceTeam(match.id, winnerId)}
                        onUpdate={(updates) => onMatchUpdate(match.id, updates)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Connector to next round */}
                {roundIdx < roundNames.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform translate-x-3">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Champion Placeholder */}
          {bracketType === "single_elimination" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: roundNames.length * 0.1 }}
              className="flex flex-col min-w-[200px]"
            >
              <div className="mb-4 pb-2 border-b border-border/50">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-yellow-500 font-display">
                  Champion
                </h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <ChampionCard matches={matches} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Drag overlay for team assignment */}
      {isDragging && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-medium">Drop team on a match to assign</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Editable Match Card
interface EditableMatchCardProps {
  match: Match;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onAdvance: (winnerId: string) => void;
  onUpdate: (updates: Partial<Match>) => void;
}

function EditableMatchCard({
  match,
  isSelected,
  isDragging,
  onSelect,
  onAdvance,
  onUpdate,
}: EditableMatchCardProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative bg-card border rounded-xl overflow-hidden transition-all",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isLive && "border-red-500/50 animate-pulse",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border/50">
        <span className="text-xs text-muted-foreground font-mono">
          M{match.matchIndex + 1}
        </span>
        {isLive && (
          <Badge className="bg-red-500/90 text-white text-[10px] px-2">
            LIVE
          </Badge>
        )}
        {isFinished && (
          <Badge variant="outline" className="text-[10px]">Final</Badge>
        )}
      </div>

      {/* Teams */}
      <div className="divide-y divide-border/50">
        <TeamSlot
          team={match.team1}
          seed={match.team1?.seed}
          score={match.team1 ? 0 : undefined}
          isWinner={match.winner === "team1"}
          isLive={isLive}
          onAssign={() => {}}
          showControls={isSelected}
        />
        <TeamSlot
          team={match.team2}
          seed={match.team2?.seed}
          score={match.team2 ? 0 : undefined}
          isWinner={match.winner === "team2"}
          isLive={isLive}
          onAssign={() => {}}
          showControls={isSelected}
        />
      </div>

      {/* Edit Controls */}
      <AnimatePresence>
        {isSelected && !isFinished && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 overflow-hidden"
          >
            <div className="p-2 flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add Team
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2">
                <Users className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Team Slot
interface TeamSlotProps {
  team?: Team;
  seed?: number;
  score?: number;
  isWinner?: boolean;
  isLive?: boolean;
  onAssign: () => void;
  showControls?: boolean;
}

function TeamSlot({
  team,
  seed,
  score,
  isWinner,
  isLive,
  onAssign,
  showControls,
}: TeamSlotProps) {
  if (!team) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 text-muted-foreground/50 italic text-sm border-2 border-dashed border-border/30 m-1 rounded-lg">
        <span className="flex items-center gap-2">
          <Plus className="w-3 h-3" />
          TBD
        </span>
        <span className="text-muted-foreground/30">-</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 transition-colors",
        isWinner && "bg-primary/10"
      )}
    >
      <div className="flex items-center gap-2">
        {seed !== undefined && (
          <span className="text-[10px] text-muted-foreground font-mono w-5 text-center bg-muted/50 rounded">
            {seed}
          </span>
        )}
        <span
          className={cn(
            "font-medium text-sm",
            isWinner ? "text-primary" : "text-foreground"
          )}
        >
          {team.name}
        </span>
        {isWinner && <Trophy className="w-3 h-3 text-primary" />}
      </div>
      <span
        className={cn(
          "font-bold text-lg tabular-nums font-display",
          isWinner ? "text-primary" : "text-foreground",
          isLive && !isWinner && "text-muted-foreground"
        )}
      >
        {score ?? (isLive ? 0 : "-")}
      </span>
    </div>
  );
}

// Champion Card
function ChampionCard({ matches }: { matches: Match[] }) {
  const finalMatch = matches.find(
    (m) =>
      m.roundName.toLowerCase().includes("final") ||
      m.roundName.toLowerCase().includes("championship")
  );

  if (!finalMatch || !finalMatch.winner) {
    return (
      <div className="w-full p-6 border-2 border-dashed border-yellow-500/30 rounded-xl text-center">
        <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-500/30" />
        <span className="text-sm text-muted-foreground/50 font-display">TBD</span>
      </div>
    );
  }

  const winner =
    finalMatch.winner === "team1" ? finalMatch.team1 : finalMatch.team2;

  if (!winner) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-full p-6 bg-gradient-to-br from-yellow-500/20 via-yellow-400/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl text-center"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
      </motion.div>
      <span className="font-bold text-lg font-display block">{winner.name}</span>
      {winner.seed !== undefined && (
        <span className="text-xs text-muted-foreground mt-1 block">
          Seed #{winner.seed}
        </span>
      )}
    </motion.div>
  );
}

export default BracketEditor;
