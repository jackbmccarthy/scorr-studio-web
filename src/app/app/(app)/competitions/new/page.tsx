"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Badge } from "@/components/ui";
import { getAllSports } from "@/lib/sports";
import { useTenant } from "@/components/tenant-provider";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { ArrowLeft, Save, Trophy, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCompetitionPage() {
  const router = useRouter();
  const { tenantId, currentSportId } = useTenant();
  const sports = getAllSports();
  const currentSport = sports.find(s => s.id === currentSportId);
  const createCompetition = useMutation(api.competitions.create);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    venueName: "",
    venueAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSportId || !tenantId) {
      setError("Missing sport or tenant selection");
      return;
    }
    
    if (!formData.name.trim()) {
      setError("Competition name is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCompetition({
        tenantId,
        sportId: currentSportId,
        name: formData.name.trim(),
        description: formData.description || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        venueName: formData.venueName || undefined,
        venueAddress: formData.venueAddress || undefined,
      });

      router.push(`/app/competitions/${result.competitionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create competition");
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
              Please select a sport before creating a competition
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
        <Link href="/app/competitions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Competition</h1>
          <p className="text-muted-foreground">Create a new tournament or event</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Competition Details</CardTitle>
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
              <Label htmlFor="name">Competition Name *</Label>
              <Input
                id="name"
                placeholder="Spring Championship 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the competition..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name</Label>
                <Input
                  id="venueName"
                  placeholder="Sports Complex"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueAddress">Venue Address</Label>
                <Input
                  id="venueAddress"
                  placeholder="123 Main St, City, State"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                />
              </div>
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
          <Link href="/app/competitions">
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
                Create Competition
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
