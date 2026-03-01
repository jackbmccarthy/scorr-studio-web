"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@/components/ui";
import { getAllSports } from "@/lib/sports";
import { useTenant } from "@/components/tenant-provider";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { ArrowLeft, Save, Trophy, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewLeaguePage() {
  const router = useRouter();
  const { tenantId, currentSportId } = useTenant();
  const sports = getAllSports();
  const currentSport = sports.find(s => s.id === currentSportId);
  const createLeague = useMutation(api.leagues.create);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "team_simple",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSportId || !tenantId) {
      setError("Missing sport or tenant selection");
      return;
    }
    
    if (!formData.name.trim()) {
      setError("League name is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await createLeague({
        tenantId,
        sportId: currentSportId,
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description || undefined,
      });

      router.push(`/app/leagues/${result.leagueId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create league");
      setIsLoading(false);
    }
  };

  if (!currentSportId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No sport selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a sport before creating a league
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/leagues">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New League</h1>
          <p className="text-muted-foreground">Create a new league or season</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>League Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sport (Read-only) */}
            <div className="space-y-2">
              <Label>Sport</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {currentSport?.name ?? "Unknown"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  (Selected in dashboard)
                </span>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">League Name *</Label>
              <Input
                id="name"
                placeholder="Premier League 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">League Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select league type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="team_simple">Team (Single Match)</SelectItem>
                  <SelectItem value="team_multi_match">Team (Multi-Match Series)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the league..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/app/leagues">
            <Button variant="outline" type="button" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create League
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
