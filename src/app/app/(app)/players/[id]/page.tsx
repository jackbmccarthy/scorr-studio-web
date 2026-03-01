"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, CardContent, Badge, Input, Avatar, AvatarFallback, Dialog, DialogContent, DialogHeader, DialogTitle, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Trophy,
  TrendingUp,
  Star,
  Users,
  Activity,
  BarChart3,
  Shield,
  Crown,
  Plus,
  Tag,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";

// Mock data - will be replaced with Convex queries
const mockPlayer = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  avatarUrl: null,
  dateOfBirth: "1995-03-15",
  gender: "Male",
  rating: 4.8,
  ratingSystem: "dupr",
  totalMatches: 45,
  wins: 32,
  losses: 13,
  notes: "Team captain. Strong forehand. Prefers aggressive play style.",
  tags: ["Pro", "Singles", "Right-handed"],
  teams: [
    { id: "t1", name: "Thunder Hawks", role: "captain", competitionName: "Spring Championship 2024" },
  ],
  createdAt: "2024-01-15T10:00:00Z",
};

const mockMatchHistory = [
  { id: "m1", opponent: "vs Taylor Smith", result: "win", score: "11-8, 11-5", date: "2024-02-10", competition: "Spring Championship" },
  { id: "m2", opponent: "vs Chris Martinez", result: "win", score: "11-9, 8-11, 11-7", date: "2024-02-08", competition: "Spring Championship" },
  { id: "m3", opponent: "vs Morgan Davis", result: "loss", score: "9-11, 11-8, 9-11", date: "2024-02-05", competition: "Spring Championship" },
  { id: "m4", opponent: "vs Jamie Wilson", result: "win", score: "11-3, 11-6", date: "2024-02-01", competition: "Spring Championship" },
  { id: "m5", opponent: "vs Taylor Smith", result: "win", score: "11-7, 11-9", date: "2024-01-28", competition: "Winter League" },
];

const mockHeadToHead = [
  { opponent: "Taylor Smith", wins: 3, losses: 1 },
  { opponent: "Chris Martinez", wins: 2, losses: 1 },
  { opponent: "Morgan Davis", wins: 1, losses: 2 },
  { opponent: "Jamie Wilson", wins: 4, losses: 0 },
];

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <PlayerDetailClient id={id} />;
}

function PlayerDetailClient({ id }: { id: string }) {
  const [player] = useState(mockPlayer);
  const [matchHistory] = useState(mockMatchHistory);
  const [headToHead] = useState(mockHeadToHead);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Calculate stats
  const winPercentage = player.totalMatches > 0 
    ? Math.round((player.wins / player.totalMatches) * 100) 
    : 0;

  const initials = player.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <FadeIn>
            <Link href="/app/players" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Players
            </Link>
          </FadeIn>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Player Info */}
            <div className="lg:col-span-8">
              <SlideIn direction="up" delay={0.1}>
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                      <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold truncate">{player.name}</h1>
                      {player.teams.some(t => t.role === 'captain') && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Captain
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-yellow-500">{player.rating}</span>
                        <span className="text-xs text-muted-foreground">({player.ratingSystem?.toUpperCase()})</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {player.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
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
                      <AnimatedNumber value={player.wins} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Wins</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      <AnimatedNumber value={player.losses} />
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
                    <div className="text-2xl font-bold">
                      <AnimatedNumber value={player.totalMatches} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary to-transparent" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {player.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a href={`mailto:${player.email}`} className="text-sm hover:text-primary transition-colors">
                          {player.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {player.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a href={`tel:${player.phone}`} className="text-sm hover:text-primary transition-colors">
                          {player.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {player.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="text-sm">
                          {new Date(player.dateOfBirth).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {player.gender && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="text-sm">{player.gender}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Memberships */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Teams</h2>
                </div>
                <div className="space-y-3">
                  {player.teams.map((team) => (
                    <Link key={team.id} href={`/app/teams/${team.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{team.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {team.competitionName}
                          </p>
                        </div>
                        {team.role === 'captain' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </motion.div>
                    </Link>
                  ))}
                  {player.teams.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No team memberships
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {player.notes && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">Notes</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {player.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Match History */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Match History</h2>
                  </div>
                  <Link href={`/app/matches?player=${player.id}`}>
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
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{match.opponent}</p>
                        <p className="text-sm text-muted-foreground">{match.competition}</p>
                        <p className="text-xs text-muted-foreground">{match.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm">{match.score}</span>
                        <Badge 
                          className={
                            match.result === 'win' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
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

            {/* Head to Head */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Head-to-Head</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {headToHead.map((h2h, index) => (
                    <motion.div
                      key={h2h.opponent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border border-border"
                    >
                      <p className="font-medium mb-3">{h2h.opponent}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-500">{h2h.wins} Wins</span>
                            <span className="text-red-500">{h2h.losses} Losses</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-green-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(h2h.wins / (h2h.wins + h2h.losses)) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Statistics Overview</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-3xl font-bold">{player.totalMatches}</p>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-500/10">
                    <p className="text-3xl font-bold text-green-500">{player.wins}</p>
                    <p className="text-sm text-muted-foreground">Wins</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-500/10">
                    <p className="text-3xl font-bold text-red-500">{player.losses}</p>
                    <p className="text-sm text-muted-foreground">Losses</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <p className="text-3xl font-bold text-primary">{winPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Name *</Label>
              <Input defaultValue={player.name} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue={player.email} className="mt-1.5" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input defaultValue={player.phone} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rating</Label>
                <Input type="number" step="0.1" defaultValue={player.rating} className="mt-1.5" />
              </div>
              <div>
                <Label>Rating System</Label>
              <div className="mt-1.5">
                <Select defaultValue={player.ratingSystem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dupr">DUPR</SelectItem>
                    <SelectItem value="elo">ELO</SelectItem>
                    <SelectItem value="utr">UTR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <Input defaultValue={player.tags.join(', ')} className="mt-1.5" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea defaultValue={player.notes} className="mt-1.5" rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowEditDialog(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
