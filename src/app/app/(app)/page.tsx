// Dashboard Page - Broadcast-Grade Industrial Design

"use client";

import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui";
import { getAllSports } from "@/lib/sports";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useTenant } from "@/components/tenant-provider";
import {
  Plus,
  Calendar,
  Trophy,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Activity,
  Flame,
  FileText,
  Loader2,
} from "lucide-react";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber, Pulse } from "@/components/motion";

export default function DashboardPage() {
  const sports = getAllSports();
  const { tenantId, currentSportId, enabledSports } = useTenant();
  const currentSport = sports.find(s => s.id === currentSportId);

  const matches = useQuery(api.matches.getByTenant as any, { tenantId, sportId: currentSportId ?? undefined }) as any[] | undefined;
  const liveMatches = useQuery(api.matches.getLiveMatches as any, { tenantId }) as any[] | undefined;
  const competitions = useQuery(api.competitions.list as any, { tenantId }) as any[] | undefined;
  const teams = useQuery(api.teams.list as any, { tenantId }) as any[] | undefined;
  const players = useQuery(api.players.list as any, { tenantId }) as any[] | undefined;

  const isLoading = matches === undefined;

  const recentMatches = (matches ?? [])
    .filter(m => !currentSportId || m.sportId === currentSportId)
    .slice(0, 3);

  const activeCompetitions = (competitions ?? []).filter(
    (c: any) => c.status === "live" || c.status === "active" || c.status === "upcoming"
  );

  const totalEntities = (teams?.length ?? 0) + (players?.length ?? 0);

  const stats = [
    { label: "TOTAL MATCHES", value: String(matches?.length ?? 0), change: null, icon: Calendar, color: "text-blue-500" },
    { label: "ACTIVE COMPETITIONS", value: String(activeCompetitions.length), change: null, icon: Trophy, color: "text-amber-500" },
    { label: "TEAMS & PLAYERS", value: String(totalEntities), change: null, icon: Users, color: "text-green-500" },
    { label: "LIVE NOW", value: String(liveMatches?.length ?? 0), change: null, icon: Flame, color: "text-red-500", isLive: (liveMatches?.length ?? 0) > 0 },
  ];

  const getMatchSportName = (match: any) => {
    const sport = sports.find(s => s.id === match.sportId);
    return sport?.name ?? match.sportId ?? "Unknown";
  };

  const formatMatchDate = (match: any) => {
    if (match.status === "live") return "Now";
    if (match.actualStartTime) {
      const diff = Date.now() - new Date(match.actualStartTime).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return "Just now";
      if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      return new Date(match.actualStartTime).toLocaleDateString();
    }
    if (match.createdAt) {
      return new Date(match.createdAt).toLocaleDateString();
    }
    return "Scheduled";
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Asymmetric Layout */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            {/* Left - Massive Typography */}
            <div className="lg:col-span-7">
              <FadeIn delay={0}>
                <div className="flex items-center gap-3 mb-4">
                  {(liveMatches?.length ?? 0) > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500 live-pulse" />
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Live Scoring Active
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Scoring Platform
                    </span>
                  )}
                </div>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <h1 className="text-hero mb-4">
                  <span className="gradient-text">BROADCAST</span>
                  <br />
                  <span className="text-foreground">GRADE</span>
                </h1>
              </SlideIn>

              <FadeIn delay={0.3}>
                <p className="text-xl text-muted-foreground max-w-xl">
                  {currentSport 
                    ? `Managing ${currentSport.name} matches and competitions.`
                    : "Professional scoring platform for sports broadcasters."}
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-wrap gap-4 mt-8">
                  <Link href="/app/matches/new">
                    <Button size="lg" className="h-12 px-8 text-base glow-accent">
                      <Plus className="w-5 h-5 mr-2" />
                      New Match
                    </Button>
                  </Link>
                  <Link href="/app/displays">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border hover:bg-accent">
                      View Displays
                    </Button>
                  </Link>
                  <Link href="/app/print">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border hover:bg-accent">
                      <FileText className="w-5 h-5 mr-2" />
                      Print Center
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right - Stats Grid */}
            <div className="lg:col-span-5">
              <StaggerContainer className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <StaggerItem key={stat.label}>
                    <Link href="/app/matches">
                      <Card className={`relative overflow-hidden transition-all hover:scale-105 hover:border-accent cursor-pointer ${stat.isLive ? 'border-red-500/50 glow-live' : ''}`}>
                        <CardContent className="p-4 lg:p-6">
                          <div className="flex items-start justify-between mb-2">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            {stat.isLive && (
                              <Pulse>
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                              </Pulse>
                            )}
                          </div>
                          <div className="stat-number">
                            {isLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            ) : (
                              <AnimatedNumber value={stat.value} />
                            )}
                          </div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
                            {stat.label}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-blue-500 to-transparent" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Recent Matches - Main Column */}
          <div className="lg:col-span-8">
            <SlideIn direction="up" delay={0.5}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-section text-foreground">
                    Recent Matches
                    {currentSport && <span className="text-muted-foreground"> - {currentSport.name}</span>}
                  </h2>
                  <p className="text-muted-foreground mt-1">Your latest scoring activity</p>
                </div>
                <Link href="/app/matches">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </SlideIn>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="animate-pulse flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-5 bg-muted rounded w-48" />
                          <div className="h-3 bg-muted rounded w-32" />
                        </div>
                        <div className="h-10 bg-muted rounded w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentMatches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No matches yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {currentSport 
                      ? `Create your first ${currentSport.name} match to get started`
                      : "Create your first match to get started"}
                  </p>
                  <Link href="/app/matches/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Match
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <StaggerContainer className="space-y-3">
                {recentMatches.map((match: any) => (
                  <StaggerItem key={match._id}>
                    <Link href={`/app/matches/${match.matchId}?sport=${match.sportId}`}>
                      <Card className="transition-all hover:scale-[1.02] hover:border-accent cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            {/* Match Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs font-medium border-border">
                                  {getMatchSportName(match)}
                                </Badge>
                                {match.status === "live" && (
                                  <Badge className="bg-red-500 border-red-500 glow-live">
                                    <Activity className="w-3 h-3 mr-1 animate-pulse" />
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                              <p className="text-lg font-semibold text-foreground">
                                {match.team1?.name ?? "TBD"} <span className="text-muted-foreground">vs</span> {match.team2?.name ?? "TBD"}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatMatchDate(match)}
                              </p>
                            </div>

                            {/* Score */}
                            <div className="text-right ml-6">
                              <div className="text-4xl font-display font-bold tracking-tight">
                                <span className="text-primary">{match.team1?.score ?? 0}</span>
                                <span className="text-muted-foreground mx-2">-</span>
                                <span className="text-foreground">{match.team2?.score ?? 0}</span>
                              </div>
                              {match.status === "scheduled" && (
                                <Badge variant="secondary" className="mt-2 text-xs">Scheduled</Badge>
                              )}
                              {match.status === "finished" && (
                                <Badge variant="outline" className="mt-2 text-xs">Final</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <SlideIn direction="right" delay={0.6}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/app/matches/new" className="block">
                    <Button variant="outline" className="w-full justify-start h-11 border-border hover:border-accent">
                      <Plus className="w-4 h-4 mr-3" />
                      Create New Match
                    </Button>
                  </Link>
                  <Link href="/app/competitions/new" className="block">
                    <Button variant="outline" className="w-full justify-start h-11 border-border hover:border-accent">
                      <Trophy className="w-4 h-4 mr-3" />
                      New Competition
                    </Button>
                  </Link>
                  <Link href="/app/displays" className="block">
                    <Button variant="outline" className="w-full justify-start h-11 border-border hover:border-accent">
                      <TrendingUp className="w-4 h-4 mr-3" />
                      Manage Displays
                    </Button>
                  </Link>
                  <Link href="/app/print" className="block">
                    <Button variant="outline" className="w-full justify-start h-11 border-border hover:border-accent">
                      <FileText className="w-4 h-4 mr-3" />
                      Print Center
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </SlideIn>

            {/* Current Sport Info */}
            <SlideIn direction="right" delay={0.7}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Sport</CardTitle>
                  <CardDescription>
                    {enabledSports.length} sport{enabledSports.length !== 1 ? "s" : ""} enabled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentSport ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{currentSport.name}</p>
                          <p className="text-xs text-muted-foreground">Active context</p>
                        </div>
                      </div>
                      <Link href="/app/settings?sports=true">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">No sport selected</p>
                      <Link href="/app/settings?sports=true">
                        <Button size="sm">Select Sport</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SlideIn>
          </div>
        </div>
      </div>
    </div>
  );
}
