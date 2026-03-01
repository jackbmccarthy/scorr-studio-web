"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, Badge, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, Avatar, AvatarFallback } from "@/components/ui";
import {
  Save,
  Trash2,
  Mail,
  Phone,
  Star,
  Loader2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { FadeIn, SlideIn } from "@/components/motion";

function EditPlayerContent() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const playerId = params.playerId as string;

  const player = useQuery(api.players.getById as any, { playerId }) as any;
  const competition = useQuery(api.competitions.getById as any, { competitionId }) as any;

  const updatePlayer = useMutation(api.players.update);
  const deletePlayer = useMutation(api.players.remove);
  const addTag = useMutation(api.players.addTag);
  const removeTag = useMutation(api.players.removeTag);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    rating: 0,
    ratingSystem: "",
    notes: "",
    tags: [] as string[],
  });

  useEffect(() => {
    if (player) {
      setEditForm({
        name: player.name ?? "",
        email: player.email ?? "",
        phone: player.phone ?? "",
        rating: player.rating ?? 0,
        ratingSystem: player.ratingSystem ?? "",
        notes: player.notes ?? "",
        tags: player.tags ?? [],
      });
    }
  }, [player]);

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setError("Player name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updatePlayer({
        playerId,
        name: editForm.name.trim(),
        email: editForm.email.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        rating: editForm.rating || undefined,
        ratingSystem: editForm.ratingSystem.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
        tags: editForm.tags,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deletePlayer({ playerId });
      router.push(`/app/competitions/${competitionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      await addTag({ playerId, tag: newTag.trim() });
      setEditForm({ ...editForm, tags: [...editForm.tags, newTag.trim()] });
      setNewTag("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tag");
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag({ playerId, tag });
      setEditForm({ ...editForm, tags: editForm.tags.filter(t => t !== tag) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove tag");
    }
  };

  if (player === undefined || competition === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Player not found</h3>
            <Link href={`/app/competitions/${competitionId}`}>
              <Button>Back to Competition</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalMatches = player.totalMatches ?? 0;
  const wins = player.wins ?? 0;
  const losses = player.losses ?? 0;
  const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/app/competitions" className="hover:text-foreground transition-colors">
                Competitions
              </Link>
              <span>/</span>
              <Link href={`/app/competitions/${competitionId}`} className="hover:text-foreground transition-colors">
                {competition?.name ?? "Competition"}
              </Link>
              <span>/</span>
              <span className="text-foreground">{player.name}</span>
            </div>
          </FadeIn>

          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20 border-4 border-border">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {player.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <SlideIn direction="up" delay={0.1}>
                <h1 className="text-2xl font-bold truncate mb-1">{player.name}</h1>
                {player.rating && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{player.rating}</span>
                    {player.ratingSystem && (
                      <span className="text-xs">({player.ratingSystem.toUpperCase()})</span>
                    )}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-1">{competition?.name}</p>
              </SlideIn>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Details
                  </Button>
                  <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      name: player.name ?? "",
                      email: player.email ?? "",
                      phone: player.phone ?? "",
                      rating: player.rating ?? 0,
                      ratingSystem: player.ratingSystem ?? "",
                      notes: player.notes ?? "",
                      tags: player.tags ?? [],
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-4 pt-4">
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {isEditing ? (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Player Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    value={editForm.rating || ""}
                    onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Rating System</Label>
                  <Input
                    value={editForm.ratingSystem}
                    onChange={(e) => setEditForm({ ...editForm, ratingSystem: e.target.value })}
                    placeholder="e.g., UTR, NTRP"
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Notes</Label>
                  <Input
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button variant="outline" onClick={handleAddTag} disabled={!newTag.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {player.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <a href={`mailto:${player.email}`} className="text-primary hover:underline">
                        {player.email}
                      </a>
                    </div>
                  )}
                  {player.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a href={`tel:${player.phone}`} className="text-primary hover:underline">
                        {player.phone}
                      </a>
                    </div>
                  )}
                  {!player.email && !player.phone && (
                    <p className="text-muted-foreground">No contact information provided</p>
                  )}
                </div>

                {!isEditing && (player.tags?.length ?? 0) > 0 && (
                  <>
                    <div className="h-px bg-border my-6" />
                    <h2 className="text-lg font-semibold mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {player.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Matches</span>
                    <span className="font-bold">{totalMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wins</span>
                    <span className="font-bold text-green-500">{wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Losses</span>
                    <span className="font-bold text-red-500">{losses}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-bold">{winPercentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete "{player.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Delete Player
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EditPlayerPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <EditPlayerContent />
    </Suspense>
  );
}
