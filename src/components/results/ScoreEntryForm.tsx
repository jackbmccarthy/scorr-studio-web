"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ScoreEntryFormProps {
  matchId: string;
  competitionId: string;
  tenantId: string;
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  initialSets?: { setNumber: number; team1Score: number; team2Score: number }[];
}

const scoreSchema = z.object({
  sets: z.array(z.object({
    setNumber: z.number(),
    team1Score: z.number().min(0),
    team2Score: z.number().min(0),
  })),
  winnerId: z.string().min(1, "Winner is required"),
  notes: z.string().optional(),
});

export function ScoreEntryForm({ matchId, competitionId, tenantId, team1, team2, initialSets }: ScoreEntryFormProps) {
  const router = useRouter();
  const submitResult = useMutation(api.results.submitResult as any);
  const calculateStandings = useMutation(api.analytics.calculateStandings as any);
  
  const [sets, setSets] = useState(initialSets || [{ setNumber: 1, team1Score: 0, team2Score: 0 }]);
  const [winnerId, setWinnerId] = useState<string>("");

  const handleAddSet = () => {
    setSets([...sets, { setNumber: sets.length + 1, team1Score: 0, team2Score: 0 }]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }));
      setSets(newSets);
    }
  };

  const updateScore = (index: number, team: 'team1' | 'team2', value: number) => {
    const newSets = [...sets];
    if (team === 'team1') newSets[index].team1Score = value;
    else newSets[index].team2Score = value;
    setSets(newSets);

    // Auto-detect winner based on sets won?
    // Let's count sets won
    let t1Sets = 0;
    let t2Sets = 0;
    newSets.forEach(s => {
      if (s.team1Score > s.team2Score) t1Sets++;
      else if (s.team2Score > s.team1Score) t2Sets++;
    });

    if (t1Sets > t2Sets) setWinnerId(team1.id);
    else if (t2Sets > t1Sets) setWinnerId(team2.id);
  };

  const handleSubmit = async () => {
    if (!winnerId) {
      toast.error("Please select a winner");
      return;
    }

    try {
      await submitResult({
        tenantId,
        matchId,
        competitionId,
        scores: sets,
        winner: {
          teamId: winnerId,
          teamName: winnerId === team1.id ? team1.name : team2.name,
        },
        loser: {
          teamId: winnerId === team1.id ? team2.id : team1.id,
          teamName: winnerId === team1.id ? team2.name : team1.name,
        },
        completedAt: new Date().toISOString(),
      });

      // Update standings
      await calculateStandings({
        competitionId,
        tenantId,
      });

      toast.success("Result submitted successfully!");
      router.push(`/matches/${matchId}`); // Redirect to match page or results list
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit result");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Enter Match Result</CardTitle>
        <CardDescription>Record the final scores for each set.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teams Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center text-center pb-4 border-b border-border/50">
          <div className="font-bold text-lg">{team1.name}</div>
          <div className="text-muted-foreground text-sm">vs</div>
          <div className="font-bold text-lg">{team2.name}</div>
        </div>

        {/* Sets Input */}
        <div className="space-y-4">
          {sets.map((set, index) => (
            <div key={index} className="flex items-center gap-4 bg-secondary/20 p-3 rounded-lg border border-border/50">
              <span className="text-sm font-mono text-muted-foreground w-12">Set {set.setNumber}</span>
              
              <div className="flex-1 flex items-center justify-end gap-2">
                <Input 
                  type="number" 
                  min={0}
                  value={set.team1Score}
                  onChange={(e) => updateScore(index, 'team1', parseInt(e.target.value) || 0)}
                  className="w-20 text-center font-mono text-lg h-12"
                />
              </div>
              
              <span className="text-muted-foreground">-</span>
              
              <div className="flex-1 flex items-center justify-start gap-2">
                <Input 
                  type="number" 
                  min={0}
                  value={set.team2Score}
                  onChange={(e) => updateScore(index, 'team2', parseInt(e.target.value) || 0)}
                  className="w-20 text-center font-mono text-lg h-12"
                />
              </div>

              {sets.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveSet(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={handleAddSet} className="w-full border-dashed border-2">
          <Plus className="mr-2 h-4 w-4" /> Add Set
        </Button>

        {/* Winner Selection */}
        <div className="pt-4 border-t border-border/50">
          <Label className="mb-2 block">Match Winner</Label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${winnerId === team1.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              onClick={() => setWinnerId(team1.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{team1.name}</span>
                {winnerId === team1.id && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </div>
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${winnerId === team2.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              onClick={() => setWinnerId(team2.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{team2.name}</span>
                {winnerId === team2.id && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!winnerId}>
          Submit Result <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
