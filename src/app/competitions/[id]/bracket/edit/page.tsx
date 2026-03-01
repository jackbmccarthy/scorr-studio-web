"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BracketEditor } from "@/components/brackets/BracketEditor";
import {
  Trophy,
  Users,
  Settings,
  ArrowLeft,
  Shuffle,
  RefreshCw,
  Check,
  AlertCircle,
  GripVertical
} from "lucide-react";
import Link from "next/link";

export default function BracketEditPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bracketType, setBracketType] = useState("single_elimination");
  const [seedOrder, setSeedOrder] = useState("standard");
  const [byeHandling, setByeHandling] = useState("highest_seed");
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState(false);
  const [teams, setTeams] = useState<Array<{
    id: string;
    name: string;
    seed: number;
    checkedIn: boolean;
  }>>([]);
  const [matches, setMatches] = useState<Array<any>>([]);

  useEffect(() => {
    // Fetch teams for this competition
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        // In production, fetch from API
        // Mock data for now
        setTeams([
          { id: "t1", name: "Team Alpha", seed: 1, checkedIn: true },
          { id: "t2", name: "Team Beta", seed: 2, checkedIn: true },
          { id: "t3", name: "Team Gamma", seed: 3, checkedIn: true },
          { id: "t4", name: "Team Delta", seed: 4, checkedIn: true },
          { id: "t5", name: "Team Epsilon", seed: 5, checkedIn: true },
          { id: "t6", name: "Team Zeta", seed: 6, checkedIn: false },
          { id: "t7", name: "Team Eta", seed: 7, checkedIn: true },
          { id: "t8", name: "Team Theta", seed: 8, checkedIn: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [competitionId]);

  const handleGenerateBracket = async () => {
    setIsGenerating(true);
    try {
      // In production, call API to generate bracket
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock generated matches
      setMatches([
        { id: "m1", roundNumber: 1, roundName: "Quarter Finals", matchIndex: 0, team1: teams[0], team2: teams[7] },
        { id: "m2", roundNumber: 1, roundName: "Quarter Finals", matchIndex: 1, team1: teams[3], team2: teams[4] },
        { id: "m3", roundNumber: 1, roundName: "Quarter Finals", matchIndex: 2, team1: teams[2], team2: teams[5] },
        { id: "m4", roundNumber: 1, roundName: "Quarter Finals", matchIndex: 3, team1: teams[1], team2: teams[6] },
        { id: "m5", roundNumber: 2, roundName: "Semi Finals", matchIndex: 0 },
        { id: "m6", roundNumber: 2, roundName: "Semi Finals", matchIndex: 1 },
        { id: "m7", roundNumber: 3, roundName: "Final", matchIndex: 0 },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBracket = async () => {
    // Save bracket to database
    router.push(`/competitions/${competitionId}/bracket`);
  };

  const checkedInTeams = teams.filter(t => t.checkedIn);
  const canGenerate = checkedInTeams.length >= 2;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg w-1/3" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
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
              <Link href={`/competitions/${competitionId}/bracket`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Bracket
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display">Bracket Editor</h1>
                  <p className="text-sm text-muted-foreground">
                    Configure and generate tournament bracket
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setMatches([])}
                disabled={matches.length === 0}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                onClick={handleSaveBracket}
                disabled={matches.length === 0}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Save Bracket
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="space-y-4">
            {/* Bracket Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Bracket Type</CardTitle>
                <CardDescription>
                  Choose the tournament format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={bracketType} onValueChange={setBracketType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_elimination">Single Elimination</SelectItem>
                    <SelectItem value="double_elimination">Double Elimination</SelectItem>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="swiss">Swiss System</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="thirdPlace"
                    checked={thirdPlaceMatch}
                    onCheckedChange={(checked) => setThirdPlaceMatch(checked as boolean)}
                  />
                  <label
                    htmlFor="thirdPlace"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include 3rd place match
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Seeding Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Seeding Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Seed Order</Label>
                  <Select value={seedOrder} onValueChange={setSeedOrder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (1v8, 2v7, etc.)</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="snake">Snake Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bye Handling</Label>
                  <Select value={byeHandling} onValueChange={setByeHandling}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highest_seed">Highest seeds get byes</SelectItem>
                      <SelectItem value="random">Random byes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Teams */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display">Teams</CardTitle>
                  <Badge variant="outline">
                    {checkedInTeams.length}/{teams.length} checked in
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teams.map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-all",
                        team.checkedIn
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/50 border-border/50 opacity-50"
                      )}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {team.seed}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">
                        {team.name}
                      </span>
                      {team.checkedIn && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateBracket}
              disabled={!canGenerate || isGenerating}
              className="w-full gap-2 h-12 text-base"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5" />
                  Generate Bracket
                </>
              )}
            </Button>

            {!canGenerate && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4" />
                <span>Need at least 2 checked-in teams</span>
              </div>
            )}
          </div>

          {/* Bracket Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full min-h-[600px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Bracket Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-12">
                    <div className="space-y-3">
                      <Trophy className="w-16 h-16 mx-auto text-muted-foreground/20" />
                      <h3 className="text-lg font-medium text-muted-foreground">
                        No bracket generated yet
                      </h3>
                      <p className="text-sm text-muted-foreground/70 max-w-sm">
                        Configure your settings and click "Generate Bracket" to create the tournament bracket
                      </p>
                    </div>
                  </div>
                ) : (
                  <BracketEditor
                    matches={matches.map((m, idx) => ({
                      id: m.id,
                      roundNumber: m.roundNumber,
                      roundName: m.roundName,
                      matchIndex: m.matchIndex,
                      team1: m.team1,
                      team2: m.team2,
                      status: "scheduled",
                    }))}
                    teams={teams}
                    bracketType={bracketType as any}
                    onMatchUpdate={(id, updates) => {
                      console.log("Update match:", id, updates);
                    }}
                    onRegenerate={handleGenerateBracket}
                    onAdvanceTeam={(matchId, winnerId) => {
                      console.log("Advance team:", matchId, winnerId);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
