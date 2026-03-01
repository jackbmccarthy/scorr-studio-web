"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, Badge, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Avatar, AvatarFallback } from "@/components/ui";
import {
  Save,
  Trash2,
  Users,
  Plus,
  Crown,
  GripVertical,
  Loader2,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { FadeIn, SlideIn } from "@/components/motion";

function EditTeamContent() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  const teamId = params.teamId as string;

  const team = useQuery(api.teams.getById as any, { teamId }) as any;
  const league = useQuery(api.leagues.getById as any, { leagueId }) as any;

  const updateTeam = useMutation(api.teams.update);
  const deleteTeam = useMutation(api.teams.remove);
  const addPlayerToTeam = useMutation(api.teams.addPlayerToTeam);
  const removePlayerFromTeam = useMutation(api.teams.removePlayerFromTeam);
  const updatePlayerRole = useMutation(api.teams.updatePlayerRole);
  const setCaptain = useMutation(api.teams.setCaptain);

  const [isEditing, setIsEditing] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    shortName: "",
    color: "#3b82f6",
    seed: 0,
  });

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    number: "",
    position: "",
  });

  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (team) {
      setEditForm({
        name: team.name ?? "",
        shortName: team.shortName ?? "",
        color: team.color ?? "#3b82f6",
        seed: team.seed ?? 0,
      });
      setPlayers(team.players ?? []);
    }
  }, [team]);

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setError("Team name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateTeam({
        teamId,
        name: editForm.name.trim(),
        shortName: editForm.shortName.trim() || undefined,
        color: editForm.color,
        seed: editForm.seed || undefined,
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
      await deleteTeam({ teamId });
      router.push(`/app/leagues/${leagueId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsSaving(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) return;

    setIsSaving(true);
    try {
      const playerId = crypto.randomUUID();
      await addPlayerToTeam({
        teamId,
        playerId,
        name: newPlayer.name.trim(),
        number: newPlayer.number.trim() || undefined,
        position: newPlayer.position.trim() || undefined,
        isCaptain: false,
      });

      setPlayers([...players, {
        playerId,
        name: newPlayer.name.trim(),
        number: newPlayer.number.trim() || undefined,
        position: newPlayer.position.trim() || undefined,
        isCaptain: false,
      }]);

      setNewPlayer({ name: "", number: "", position: "" });
      setShowAddPlayer(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add player");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      await removePlayerFromTeam({ teamId, playerId });
      setPlayers(players.filter(p => p.playerId !== playerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove player");
    }
  };

  const handleSetCaptain = async (playerId: string) => {
    try {
      await setCaptain({ teamId, playerId });
      setPlayers(players.map(p => ({
        ...p,
        isCaptain: p.playerId === playerId,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set captain");
    }
  };

  const handleReorder = (newOrder: typeof players) => {
    setPlayers(newOrder);
  };

  if (team === undefined || league === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Team not found</h3>
            <Link href={`/app/leagues/${leagueId}`}>
              <Button>Back to League</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalGames = (team.stats?.wins ?? 0) + (team.stats?.losses ?? 0) + (team.stats?.draws ?? 0);
  const winPercentage = totalGames > 0 ? Math.round(((team.stats?.wins ?? 0) / totalGames) * 100) : 0;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/app/leagues" className="hover:text-foreground transition-colors">
                Leagues
              </Link>
              <span>/</span>
              <Link href={`/app/leagues/${leagueId}`} className="hover:text-foreground transition-colors">
                {league?.name ?? "League"}
              </Link>
              <span>/</span>
              <span className="text-foreground">{team.name}</span>
            </div>
          </FadeIn>

          <div className="flex items-start gap-6">
            <motion.div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
              style={{ backgroundColor: editForm.color }}
              whileHover={{ scale: 1.05 }}
            >
              {editForm.shortName || editForm.name.substring(0, 3).toUpperCase()}
            </motion.div>

            <div className="flex-1 min-w-0">
              <SlideIn direction="up" delay={0.1}>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold truncate">{team.name}</h1>
                  {team.seed && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      Seed #{team.seed}
                    </Badge>
                  )}
                  {team.checkedIn && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      Checked In
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{league?.name}</p>
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
                      name: team.name ?? "",
                      shortName: team.shortName ?? "",
                      color: team.color ?? "#3b82f6",
                      seed: team.seed ?? 0,
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
              <h2 className="text-lg font-semibold mb-4">Team Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Team Name *</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Short Name</Label>
                  <Input
                    value={editForm.shortName}
                    onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                    maxLength={4}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-14 h-11 p-1"
                    />
                    <Input
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Seed</Label>
                  <Input
                    type="number"
                    value={editForm.seed || ""}
                    onChange={(e) => setEditForm({ ...editForm, seed: parseInt(e.target.value) || 0 })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Roster</h2>
                    <Badge variant="secondary">{players.length}</Badge>
                  </div>
                  <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Player to Roster</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Player Name *</Label>
                          <Input
                            value={newPlayer.name}
                            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                            placeholder="Enter player name"
                            className="mt-1.5"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Number</Label>
                            <Input
                              value={newPlayer.number}
                              onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                              placeholder="#"
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              value={newPlayer.position}
                              onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                              placeholder="Position"
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowAddPlayer(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddPlayer} disabled={!newPlayer.name.trim() || isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Add Player
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {players.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No players on roster</p>
                    <Button variant="outline" size="sm" onClick={() => setShowAddPlayer(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Player
                    </Button>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={players}
                    onReorder={handleReorder}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {players.map((player) => (
                        <Reorder.Item
                          key={player.playerId}
                          value={player}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <motion.div
                            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all group"
                            whileHover={{ scale: 1.01 }}
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {player.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {player.isCaptain && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                                <span className="font-medium truncate">{player.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {player.position || 'No position'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {player.number && (
                                <Badge variant="outline" className="font-mono">
                                  #{player.number}
                                </Badge>
                              )}
                              {!player.isCaptain && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetCaptain(player.playerId)}
                                  title="Make captain"
                                >
                                  <Crown className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleRemovePlayer(player.playerId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
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
                    <span className="font-bold">{totalGames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wins</span>
                    <span className="font-bold text-green-500">{team.stats?.wins ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Losses</span>
                    <span className="font-bold text-red-500">{team.stats?.losses ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draws</span>
                    <span className="font-bold">{team.stats?.draws ?? 0}</span>
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
            <DialogTitle>Delete Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete "{team.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Delete Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EditTeamPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <EditTeamContent />
    </Suspense>
  );
}
