"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BracketViewer } from "@/components/brackets/BracketViewer";
import { 
  Trophy, 
  Users, 
  Settings, 
  Download, 
  RefreshCw,
  Plus,
  ArrowLeft,
  Edit2,
  Share2,
  Printer
} from "lucide-react";
import Link from "next/link";

export default function BracketPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [bracket, setBracket] = useState<{
    bracketId: string;
    type: string;
    rounds: Record<number, { roundNumber: number; name: string; matches: string[] }>;
  } | null>(null);
  const [matches, setMatches] = useState<Array<{
    matchId: string;
    roundName: string;
    roundIndex: number;
    matchIndex: number;
    team1?: { name: string; score?: number; seed?: number };
    team2?: { name: string; score?: number; seed?: number };
    winner?: "team1" | "team2";
    status: "scheduled" | "live" | "finished";
  }>>([]);

  useEffect(() => {
    // Fetch bracket data
    const fetchBracket = async () => {
      setIsLoading(true);
      try {
        // In production, fetch from API
        // For now, use mock data
        setBracket({
          bracketId: "bracket-1",
          type: "single_elimination",
          rounds: {
            1: { roundNumber: 1, name: "Quarter Finals", matches: ["m1", "m2", "m3", "m4"] },
            2: { roundNumber: 2, name: "Semi Finals", matches: ["m5", "m6"] },
            3: { roundNumber: 3, name: "Final", matches: ["m7"] },
          },
        });
        setMatches([
          { matchId: "m1", roundName: "Quarter Finals", roundIndex: 1, matchIndex: 0, team1: { name: "Team Alpha", seed: 1 }, team2: { name: "Team Delta", seed: 8 }, status: "finished", winner: "team1" },
          { matchId: "m2", roundName: "Quarter Finals", roundIndex: 1, matchIndex: 1, team1: { name: "Team Beta", seed: 4 }, team2: { name: "Team Epsilon", seed: 5 }, status: "finished", winner: "team2" },
          { matchId: "m3", roundName: "Quarter Finals", roundIndex: 1, matchIndex: 2, team1: { name: "Team Gamma", seed: 3 }, team2: { name: "Team Zeta", seed: 6 }, status: "live" },
          { matchId: "m4", roundName: "Quarter Finals", roundIndex: 1, matchIndex: 3, team1: { name: "Team Theta", seed: 2 }, team2: { name: "Team Eta", seed: 7 }, status: "scheduled" },
          { matchId: "m5", roundName: "Semi Finals", roundIndex: 2, matchIndex: 0, team1: { name: "Team Alpha" }, team2: { name: "Team Epsilon" }, status: "scheduled" },
          { matchId: "m6", roundName: "Semi Finals", roundIndex: 2, matchIndex: 1, status: "scheduled" },
          { matchId: "m7", roundName: "Final", roundIndex: 3, matchIndex: 0, status: "scheduled" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBracket();
  }, [competitionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg w-1/3" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!bracket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-2xl font-bold mb-2 font-display">No Bracket Yet</h2>
              <p className="text-muted-foreground mb-6">
                Generate a bracket from the registered teams
              </p>
              <Link href={`/competitions/${competitionId}/bracket/edit`}>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Generate Bracket
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/competitions/${competitionId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display">Tournament Bracket</h1>
                  <p className="text-sm text-muted-foreground">
                    {bracket.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/competitions/${competitionId}/bracket/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Bracket Stats */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">8</p>
                  <p className="text-xs text-muted-foreground">Teams</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Trophy className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">7</p>
                  <p className="text-xs text-muted-foreground">Total Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">3</p>
                  <p className="text-xs text-muted-foreground">Rounds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Trophy className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">2</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bracket Viewer */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-border/50">
            <CardContent className="p-6">
              <BracketViewer
                matches={matches.map(m => ({
                  id: m.matchId,
                  round: m.roundName,
                  roundIndex: m.roundIndex,
                  matchIndex: m.matchIndex,
                  team1: m.team1,
                  team2: m.team2,
                  winner: m.winner,
                  status: m.status,
                }))}
                bracketType="single"
                onMatchClick={(match) => {
                  console.log("Match clicked:", match);
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
