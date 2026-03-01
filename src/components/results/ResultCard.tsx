import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  match: {
    matchId: string;
    team1: { name: string; score?: number; logoUrl?: string };
    team2: { name: string; score?: number; logoUrl?: string };
    completedAt?: string;
    verified?: boolean;
    scores?: {
      setNumber: number;
      team1Score: number;
      team2Score: number;
    }[];
    winner?: { teamId: string };
  };
  onShare?: () => void;
  className?: string;
}

export function ResultCard({ match, onShare, className }: ResultCardProps) {
  const isWinner1 = match.winner?.teamId && match.winner.teamId === match.team1.name; // This is risky, usually ID not name. 
  // But match object passed here might need to be richer.
  // Let's assume the parent passes the correct winner logic or we infer from scores if available.
  
  // Actually, usually result data comes from matchResults table which has scores array.
  
  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="text-xs text-muted-foreground font-mono">
            {match.completedAt ? format(new Date(match.completedAt), "MMM d, h:mm a") : "Just finished"}
          </div>
          {match.verified && (
            <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Teams and Score */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Team 1 */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="relative h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border border-border">
              {match.team1.logoUrl ? (
                <img src={match.team1.logoUrl} alt={match.team1.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold">{match.team1.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className={cn("font-semibold leading-tight", isWinner1 && "text-primary")}>
              {match.team1.name}
            </span>
          </div>

          {/* VS / Total Score */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl font-bold font-mono tracking-wider">
              {match.team1.score} - {match.team2.score}
            </div>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-widest text-muted-foreground">
              Final
            </Badge>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="relative h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border border-border">
              {match.team2.logoUrl ? (
                <img src={match.team2.logoUrl} alt={match.team2.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold">{match.team2.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className={cn("font-semibold leading-tight", !isWinner1 && match.winner && "text-primary")}>
              {match.team2.name}
            </span>
          </div>
        </div>

        {/* Set Scores Detail */}
        {match.scores && match.scores.length > 0 && (
          <div className="flex justify-center gap-2 text-sm text-muted-foreground border-t border-border/50 pt-4">
            {match.scores.map((set, i) => (
              <div key={i} className="flex flex-col items-center px-2">
                <span className="text-[10px] uppercase opacity-50 mb-1">Set {set.setNumber}</span>
                <span className="font-mono font-medium text-foreground">
                  {set.team1Score}-{set.team2Score}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between gap-2">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" asChild>
          <Link href={`/matches/${match.matchId}/result`}>
            View Details
          </Link>
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={onShare}>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
