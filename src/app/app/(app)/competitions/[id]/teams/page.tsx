"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, Badge, Input, Avatar, AvatarFallback, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, Select } from "@/components/ui";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Shield,
  Check,
  X,
  Crown,
  UserPlus,
  GripVertical,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";

// Mock data
const mockCompetition = {
  id: "comp-1",
  name: "Spring Championship 2024",
  maxTeams: 16,
};

const mockTeams = [
  {
    id: "1",
    name: "Thunder Hawks",
    shortName: "THK",
    color: "#3b82f6",
    seed: 1,
    checkedIn: true,
    players: [
      { playerId: "1", name: "Alex Johnson", number: "10", isCaptain: true },
      { playerId: "2", name: "Sam Williams", number: "7" },
      { playerId: "3", name: "Jordan Lee", number: "23" },
      { playerId: "4", name: "Casey Brown", number: "14" },
    ],
  },
  {
    id: "2",
    name: "Phoenix Rising",
    shortName: "PHX",
    color: "#ef4444",
    seed: 2,
    checkedIn: true,
    players: [
      { playerId: "5", name: "Taylor Smith", number: "11", isCaptain: true },
      { playerId: "6", name: "Morgan Davis", number: "8" },
      { playerId: "7", name: "Riley Garcia", number: "15" },
    ],
  },
  {
    id: "3",
    name: "Steel Dragons",
    shortName: "SDR",
    color: "#10b981",
    seed: 3,
    checkedIn: false,
    players: [
      { playerId: "8", name: "Chris Martinez", number: "4", isCaptain: true },
      { playerId: "9", name: "Jamie Wilson", number: "22" },
      { playerId: "10", name: "Drew Anderson", number: "9" },
    ],
  },
];

const mockAvailableTeams = [
  { id: "4", name: "Storm Chasers", shortName: "STC", color: "#8b5cf6", playerCount: 5 },
  { id: "5", name: "Night Owls", shortName: "NOW", color: "#f59e0b", playerCount: 4 },
  { id: "6", name: "Iron Wolves", shortName: "IRW", color: "#ec4899", playerCount: 6 },
];

export default function CompetitionTeamsPage() {
  const params = useParams();
  const id = params.id as string;
  
  return <CompetitionTeamsClient id={id} />;
}

function CompetitionTeamsClient({ id }: { id: string }) {
  const [teams, setTeams] = useState(mockTeams);
  const [search, setSearch] = useState("");
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);

  const checkedInCount = teams.filter((t) => t.checkedIn).length;
  const totalPlayers = teams.reduce((acc, t) => acc + t.players.length, 0);

  const handleReorder = (newOrder: typeof teams) => {
    setTeams(newOrder);
    // Update seeds based on new order
    const updatedTeams = newOrder.map((team, index) => ({
      ...team,
      seed: index + 1,
    }));
    setTeams(updatedTeams);
  };

  const handleCheckIn = (teamId: string) => {
    setTeams(teams.map((t) => 
      t.id === teamId ? { ...t, checkedIn: !t.checkedIn } : t
    ));
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(teams.filter((t) => t.id !== teamId));
  };

  const filteredAvailableTeams = mockAvailableTeams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) &&
    !teams.some((t) => t.id === team.id)
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/app/competitions" className="hover:text-foreground transition-colors">
                Competitions
              </Link>
              <span>/</span>
              <Link href={`/app/competitions/${id}`} className="hover:text-foreground transition-colors">
                {mockCompetition.name}
              </Link>
              <span>/</span>
              <span className="text-foreground">Teams</span>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <SlideIn direction="up" delay={0.1}>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Team Registration
                  </span>
                </div>
                <h1 className="text-hero mb-4">
                  <span className="gradient-text">REGISTERED TEAMS</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage team registrations, seeding, and check-ins for {mockCompetition.name}
                </p>
              </SlideIn>
            </div>

            <div className="lg:col-span-5">
              <StaggerContainer className="grid grid-cols-3 gap-3">
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number text-primary">
                      <AnimatedNumber value={teams.length} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Teams</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number text-green-500">
                      <AnimatedNumber value={checkedInCount} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Checked In</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number">
                      <AnimatedNumber value={totalPlayers} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Players</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {teams.length} of {mockCompetition.maxTeams} slots filled
            </p>
            {teams.length >= mockCompetition.maxTeams && (
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
                <AlertCircle className="w-3 h-3 mr-1" />
                Full
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showAddTeamDialog} onOpenChange={setShowAddTeamDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Existing Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Existing Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredAvailableTeams.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No available teams found
                      </p>
                    ) : (
                      filteredAvailableTeams.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
                          onClick={() => {
                            setTeams([...teams, { 
                              ...team, 
                              seed: teams.length + 1, 
                              checkedIn: false, 
                              players: [] 
                            }]);
                            setShowAddTeamDialog(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: team.color }}
                            >
                              {team.shortName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {team.playerCount} players
                              </p>
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setShowCreateTeamDialog(true)}>
                      Create New Team
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddTeamDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="glow-accent" onClick={() => setShowCreateTeamDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Teams List */}
        <Card>
          <CardContent className="p-6">
            {teams.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No teams registered</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding teams to this competition
                </p>
                <Button onClick={() => setShowCreateTeamDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Team
                </Button>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={teams}
                onReorder={handleReorder}
                className="space-y-3"
              >
                <AnimatePresence>
                  {teams.map((team) => (
                    <Reorder.Item
                      key={team.id}
                      value={team}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <motion.div
                        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all group"
                        layout
                      >
                        <GripVertical className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Seed */}
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {team.seed}
                        </div>

                        {/* Team Info */}
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.shortName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold truncate">{team.name}</h3>
                            {team.checkedIn && (
                              <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                                Checked In
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {team.players.length} players • {team.shortName}
                          </p>
                        </div>

                        {/* Players Preview */}
                        <div className="hidden md:flex items-center gap-2">
                          {team.players.slice(0, 4).map((player) => (
                            <Avatar key={player.playerId} className="w-8 h-8 border-2 border-background">
                              <AvatarFallback className="bg-muted text-xs">
                                {player.isCaptain && <Crown className="w-3 h-3 text-yellow-500" />}
                                {!player.isCaptain && player.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {team.players.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{team.players.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckIn(team.id)}
                            className={team.checkedIn ? 'text-green-500' : 'text-muted-foreground'}
                          >
                            {team.checkedIn ? <Check className="w-4 h-4" /> : 'Check In'}
                          </Button>
                          <Link href={`/app/teams/${team.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveTeam(team.id)}
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

        {/* Quick Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Bulk Check-In
          </Button>
          <Button variant="outline">
            Randomize Seeds
          </Button>
          <Button>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Team Name *</Label>
              <Input placeholder="Enter team name" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Short Name</Label>
                <Input placeholder="ABC" maxLength={4} className="mt-1.5" />
              </div>
              <div>
                <Label>Color</Label>
                <Input type="color" defaultValue="#3b82f6" className="mt-1.5 h-11" />
              </div>
            </div>
            <div>
              <Label>Seed (Optional)</Label>
              <Input type="number" placeholder="Auto-assigned" className="mt-1.5" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateTeamDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateTeamDialog(false)}>
                Create Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
