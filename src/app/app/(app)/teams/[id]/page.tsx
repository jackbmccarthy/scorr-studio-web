"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, Badge, Input, Avatar, AvatarFallback, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/components/ui";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  MapPin,
  Plus,
  MoreVertical,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  GripVertical,
  Activity,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";

// Mock data - will be replaced with Convex queries
const mockTeam = {
  id: "1",
  name: "Thunder Hawks",
  shortName: "THK",
  color: "#3b82f6",
  logoUrl: null,
  competitionId: "comp-1",
  competitionName: "Spring Championship 2024",
  seed: 1,
  checkedIn: true,
  players: [
    { playerId: "1", name: "Alex Johnson", number: "10", position: "Forward", isCaptain: true },
    { playerId: "2", name: "Sam Williams", number: "7", position: "Midfielder", isCaptain: false },
    { playerId: "3", name: "Jordan Lee", number: "23", position: "Defender", isCaptain: false },
    { playerId: "4", name: "Casey Brown", number: "14", position: "Goalkeeper", isCaptain: false },
  ],
  stats: { wins: 12, losses: 3, draws: 1, pointsFor: 156, pointsAgainst: 89 },
  createdAt: "2024-01-15T10:00:00Z",
};

const mockMatchHistory = [
  { id: "m1", opponent: "Phoenix Rising", result: "win", score: "3-1", date: "2024-02-10" },
  { id: "m2", opponent: "Steel Dragons", result: "win", score: "2-0", date: "2024-02-08" },
  { id: "m3", opponent: "Storm Chasers", result: "loss", score: "1-2", date: "2024-02-05" },
  { id: "m4", opponent: "Night Owls", result: "win", score: "4-2", date: "2024-02-01" },
  { id: "m5", opponent: "Phoenix Rising", result: "draw", score: "2-2", date: "2024-01-28" },
];

export default function TeamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  return <TeamDetailClient id={id} />;
}

function TeamDetailClient({ id }: { id: string }) {
  const [team, setTeam] = useState(mockTeam);
  const [matchHistory] = useState(mockMatchHistory);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [players, setPlayers] = useState(team.players);

  // Calculate stats
  const totalGames = team.stats.wins + team.stats.losses + team.stats.draws;
  const winPercentage = totalGames > 0 ? Math.round((team.stats.wins / totalGames) * 100) : 0;
  const pointDifferential = team.stats.pointsFor - team.stats.pointsAgainst;

  const handleReorder = (newOrder: typeof players) => {
    setPlayers(newOrder);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <FadeIn>
            <Link href="/app/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Teams
            </Link>
          </FadeIn>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Team Info */}
            <div className="lg:col-span-8">
              <SlideIn direction="up" delay={0.1}>
                <div className="flex items-start gap-6">
                  {/* Team Logo/Color */}
                  <motion.div 
                    className="w-24 h-24 rounded-xl flex items-center justify-center text-white font-bold text-3xl shrink-0"
                    style={{ backgroundColor: team.color }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {team.shortName}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold truncate">{team.name}</h1>
                      {team.seed && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          Seed #{team.seed}
                        </Badge>
                      )}
                      {team.checkedIn && (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          ✓ Checked In
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{team.competitionName}</p>
                    
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </SlideIn>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-4">
              <StaggerContainer className="grid grid-cols-2 gap-3">
                <StaggerItem>
                  <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      <AnimatedNumber value={team.stats.wins} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Wins</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      <AnimatedNumber value={team.stats.losses} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Losses</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
                    <div className="text-2xl font-bold">
                      <AnimatedNumber value={winPercentage} />%
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Win Rate</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
                    <div className={`text-2xl font-bold ${pointDifferential >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pointDifferential >= 0 ? '+' : ''}<AnimatedNumber value={pointDifferential} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Point Diff</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div 
          className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${team.color}, transparent)` }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Roster */}
          <div className="lg:col-span-7">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Roster</h2>
                    <Badge variant="secondary" className="ml-2">{players.length}</Badge>
                  </div>
                  <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Player to Roster</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Player</Label>
                          <Input placeholder="Search players..." className="mt-1.5" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Number</Label>
                            <Input placeholder="#" className="mt-1.5" />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Select>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="forward">Forward</SelectItem>
                                <SelectItem value="midfielder">Midfielder</SelectItem>
                                <SelectItem value="defender">Defender</SelectItem>
                                <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowAddPlayer(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setShowAddPlayer(false)}>
                            Add Player
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Player List with Drag & Drop */}
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
                              {player.name.split(' ').map(n => n[0]).join('')}
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

                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              #{player.number}
                            </Badge>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>

                {players.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No players on roster</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add First Player
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats & Match History */}
          <div className="lg:col-span-5 space-y-6">
            {/* Detailed Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Statistics</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Matches</span>
                    <span className="font-bold">{totalGames}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Wins</span>
                    <span className="font-bold text-green-500">{team.stats.wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Losses</span>
                    <span className="font-bold text-red-500">{team.stats.losses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Draws</span>
                    <span className="font-bold">{team.stats.draws}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Points For</span>
                    <span className="font-bold text-green-500">{team.stats.pointsFor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Points Against</span>
                    <span className="font-bold text-red-500">{team.stats.pointsAgainst}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Point Differential</span>
                    <span className={`font-bold ${pointDifferential >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pointDifferential >= 0 ? '+' : ''}{pointDifferential}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match History */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Match History</h2>
                  </div>
                  <Link href={`/app/matches?team=${team.id}`}>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {matchHistory.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{match.opponent}</p>
                        <p className="text-xs text-muted-foreground">{match.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold">{match.score}</span>
                        <Badge 
                          className={
                            match.result === 'win' 
                              ? 'bg-green-500/20 text-green-500' 
                              : match.result === 'loss'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }
                        >
                          {match.result.toUpperCase()}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
