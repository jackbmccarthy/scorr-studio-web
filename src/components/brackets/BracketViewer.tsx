"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Trophy, Users } from "lucide-react";

export interface BracketMatch {
  id: string;
  team1?: {
    name: string;
    score?: number;
    seed?: number;
  };
  team2?: {
    name: string;
    score?: number;
    seed?: number;
  };
  winner?: "team1" | "team2";
  status: "scheduled" | "live" | "finished";
  round: string;
  roundIndex: number;
  matchIndex: number;
  scheduledTime?: string;
}

interface BracketViewerProps {
  matches: BracketMatch[];
  bracketType?: "single" | "double";
  className?: string;
  onMatchClick?: (match: BracketMatch) => void;
}

export function BracketViewer({
  matches,
  bracketType = "single",
  className,
  onMatchClick,
}: BracketViewerProps) {
  // Group matches by round
  const rounds = matches.reduce<Record<string, BracketMatch[]>>((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {});

  const roundNames = Object.keys(rounds).sort((a, b) => {
    const aIdx = rounds[a][0]?.roundIndex ?? 0;
    const bIdx = rounds[b][0]?.roundIndex ?? 0;
    return aIdx - bIdx;
  });

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex gap-8 min-w-max p-4">
        {roundNames.map((roundName) => (
          <div key={roundName} className="flex flex-col gap-4 min-w-[250px]">
            {/* Round Header */}
            <div className="text-center pb-2 border-b border-border">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                {roundName}
              </h3>
            </div>

            {/* Matches in Round */}
            <div className="flex flex-col gap-4 justify-around flex-1">
              {rounds[roundName].map((match) => (
                <BracketMatchCard
                  key={match.id}
                  match={match}
                  onClick={() => onMatchClick?.(match)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Champion (if tournament is complete) */}
        {bracketType === "single" && roundNames.length > 0 && (
          <div className="flex flex-col gap-4 min-w-[200px]">
            <div className="text-center pb-2 border-b border-border">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Champion
              </h3>
            </div>
            <div className="flex items-center justify-center flex-1">
              <ChampionCard matches={matches} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface BracketMatchCardProps {
  match: BracketMatch;
  onClick?: () => void;
}

function BracketMatchCard({ match, onClick }: BracketMatchCardProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg overflow-hidden transition-all",
        onClick && "cursor-pointer hover:border-primary/50 hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        <span className="text-xs text-muted-foreground">
          Match {match.matchIndex + 1}
        </span>
        {isLive && (
          <Badge className="bg-red-500 text-xs animate-pulse">LIVE</Badge>
        )}
        {isFinished && (
          <Badge variant="outline" className="text-xs">Final</Badge>
        )}
        {match.scheduledTime && !isLive && !isFinished && (
          <span className="text-xs text-muted-foreground">
            {new Date(match.scheduledTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="divide-y divide-border">
        <TeamRow
          team={match.team1}
          score={match.team1?.score}
          isWinner={match.winner === "team1"}
          isLive={isLive}
        />
        <TeamRow
          team={match.team2}
          score={match.team2?.score}
          isWinner={match.winner === "team2"}
          isLive={isLive}
        />
      </div>
    </div>
  );
}

interface TeamRowProps {
  team?: { name: string; seed?: number };
  score?: number;
  isWinner?: boolean;
  isLive?: boolean;
}

function TeamRow({ team, score, isWinner, isLive }: TeamRowProps) {
  if (!team) {
    return (
      <div className="flex items-center justify-between px-3 py-2 text-muted-foreground italic text-sm">
        <span>TBD</span>
        <span>-</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2",
        isWinner && "bg-primary/10"
      )}
    >
      <div className="flex items-center gap-2">
        {team.seed !== undefined && (
          <span className="text-xs text-muted-foreground w-5 text-center">
            {team.seed}
          </span>
        )}
        <span
          className={cn(
            "font-medium",
            isWinner ? "text-primary" : "text-foreground"
          )}
        >
          {team.name}
        </span>
        {isWinner && <Trophy className="w-3 h-3 text-primary" />}
      </div>
      <span
        className={cn(
          "font-bold text-lg tabular-nums",
          isWinner ? "text-primary" : "text-foreground",
          isLive && !isWinner && "text-muted-foreground"
        )}
      >
        {score ?? (isLive ? 0 : "-")}
      </span>
    </div>
  );
}

function ChampionCard({ matches }: { matches: BracketMatch[] }) {
  // Find the final match winner
  const finalMatch = matches.find(
    (m) =>
      m.round.toLowerCase().includes("final") ||
      m.round.toLowerCase().includes("championship")
  );

  if (!finalMatch || !finalMatch.winner) {
    return (
      <div className="w-full p-4 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <span className="text-sm">TBD</span>
      </div>
    );
  }

  const winner =
    finalMatch.winner === "team1" ? finalMatch.team1 : finalMatch.team2;

  if (!winner) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg text-center">
      <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
      <span className="font-bold text-lg">{winner.name}</span>
      {winner.seed !== undefined && (
        <span className="text-xs text-muted-foreground block mt-1">
          Seed #{winner.seed}
        </span>
      )}
    </div>
  );
}

export default BracketViewer;
