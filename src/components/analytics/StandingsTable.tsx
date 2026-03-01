import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface StandingsTableProps {
  stats: {
    teamId: string;
    teamName: string;
    wins: number;
    losses: number;
    draws: number;
    pointsFor: number;
    pointsAgainst: number;
    winStreak: number;
    currentStreak: number;
    rank?: number;
    previousRank?: number;
  }[];
  className?: string;
}

export function StandingsTable({ stats, className }: StandingsTableProps) {
  // Sort by points (wins * 3 + draws)
  const sortedStats = [...stats].sort((a, b) => {
    const pointsA = a.wins * 3 + a.draws;
    const pointsB = b.wins * 3 + b.draws;
    if (pointsA !== pointsB) return pointsB - pointsA;
    // Tie-breaker: Points Diff
    const diffA = a.pointsFor - a.pointsAgainst;
    const diffB = b.pointsFor - b.pointsAgainst;
    return diffB - diffA;
  });

  return (
    <div className={cn("rounded-md border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-secondary/20">
          <TableRow>
            <TableHead className="w-[60px] text-center">Pos</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center w-[60px]">P</TableHead>
            <TableHead className="text-center w-[60px]">W</TableHead>
            <TableHead className="text-center w-[60px]">L</TableHead>
            <TableHead className="text-center w-[60px]">D</TableHead>
            <TableHead className="text-center w-[80px]">Diff</TableHead>
            <TableHead className="text-center w-[100px]">Streak</TableHead>
            <TableHead className="text-right w-[80px]">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStats.map((team, index) => {
            const rank = index + 1;
            // Diff calculation
            const diff = team.pointsFor - team.pointsAgainst;
            const streakVal = team.currentStreak;
            
            return (
              <TableRow key={team.teamId} className="hover:bg-secondary/10 cursor-pointer">
                <TableCell className="text-center font-mono font-medium text-muted-foreground">
                  {rank}
                </TableCell>
                <TableCell className="font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {team.teamName.substring(0, 2).toUpperCase()}
                    </div>
                    {team.teamName}
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono">{team.wins + team.losses + team.draws}</TableCell>
                <TableCell className="text-center font-mono text-green-500">{team.wins}</TableCell>
                <TableCell className="text-center font-mono text-destructive">{team.losses}</TableCell>
                <TableCell className="text-center font-mono text-muted-foreground">{team.draws}</TableCell>
                <TableCell className="text-center font-mono text-xs">
                  <span className={diff > 0 ? "text-green-500" : diff < 0 ? "text-destructive" : ""}>
                    {diff > 0 ? "+" : ""}{diff}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5 px-1.5 font-mono",
                    streakVal > 0 ? "border-green-500/30 text-green-500 bg-green-500/5" : 
                    streakVal < 0 ? "border-destructive/30 text-destructive bg-destructive/5" : ""
                  )}>
                    {streakVal > 0 ? `W${streakVal}` : streakVal < 0 ? `L${Math.abs(streakVal)}` : "-"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {team.wins * 3 + team.draws}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
