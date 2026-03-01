// New Match Page - Match Setup (Sport inherited from context)

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Input,
  Badge,
} from "@/components/ui";
import { getSportConfig } from "@/lib/sports";
import { useTenant } from "@/components/tenant-provider";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

function NewMatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenantId, currentSportId } = useTenant();
  const createMatch = useMutation(api.matches.create);
  
  const sport = currentSportId ? getSportConfig(currentSportId) : null;
  
  const [matchSetup, setMatchSetup] = useState({
    team1Name: "",
    team2Name: "",
    eventName: "",
    matchRound: "",
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMatch = async () => {
    if (!currentSportId || !tenantId) {
      setError("Missing sport or tenant selection");
      return;
    }
    
    if (!matchSetup.team1Name.trim() || !matchSetup.team2Name.trim()) {
      setError("Both team/player names are required");
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const matchId = uuidv4();
      
      await createMatch({
        matchId,
        tenantId,
        sportId: currentSportId,
        team1: {
          name: matchSetup.team1Name.trim(),
        },
        team2: {
          name: matchSetup.team2Name.trim(),
        },
        state: {},
        eventName: matchSetup.eventName || undefined,
        matchRound: matchSetup.matchRound || undefined,
      });

      router.push(`/app/matches/${matchId}?sport=${currentSportId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create match");
      setIsCreating(false);
    }
  };

  if (!currentSportId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/app/matches">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">New Match</h1>
            <p className="text-muted-foreground">Select a sport to create a match</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No sport selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a sport from the dashboard before creating a match
            </p>
            <Link href="/app/settings?sports=true">
              <Button>Manage Sports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/matches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Match</h1>
          <p className="text-muted-foreground">
            Setting up {sport?.name} match
          </p>
        </div>
      </div>

      {/* Selected Sport */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>{sport?.name}</CardTitle>
              <CardDescription>{sport?.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Team Setup */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Teams / Players</CardTitle>
          <CardDescription>
            Enter the names of the competing teams or players
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {sport?.id === "soccer" || sport?.id === "basketball" 
                  ? "Team 1" 
                  : "Player 1 / Team 1"}
              </label>
              <Input
                placeholder="Enter name..."
                value={matchSetup.team1Name}
                onChange={(e) => 
                  setMatchSetup({ ...matchSetup, team1Name: e.target.value })
                }
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {sport?.id === "soccer" || sport?.id === "basketball" 
                  ? "Team 2" 
                  : "Player 2 / Team 2"}
              </label>
              <Input
                placeholder="Enter name..."
                value={matchSetup.team2Name}
                onChange={(e) => 
                  setMatchSetup({ ...matchSetup, team2Name: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Details (Optional) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Match Details (Optional)</CardTitle>
          <CardDescription>
            Add event name or round information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Event / Tournament Name
              </label>
              <Input
                placeholder="e.g., Weekly Tournament"
                value={matchSetup.eventName}
                onChange={(e) => 
                  setMatchSetup({ ...matchSetup, eventName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Round
              </label>
              <Input
                placeholder="e.g., Quarter Final"
                value={matchSetup.matchRound}
                onChange={(e) => 
                  setMatchSetup({ ...matchSetup, matchRound: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={isCreating}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateMatch}
          disabled={!matchSetup.team1Name || !matchSetup.team2Name || isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Match & Start Scoring"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <NewMatchContent />
    </Suspense>
  );
}
