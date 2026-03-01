"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  MapPin,
  Printer,
  Share2,
  Plus,
  Edit,
  ArrowRight,
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { getAllSports } from "@/lib/sports";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";

export default function LeagueDetailPage() {
  const params = useParams();
  const leagueId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  const league = useQuery(api.leagues.getById as any, { leagueId }) as any;
  const teams = useQuery(api.teams.list as any, { 
    tenantId: league?.tenantId,
    competitionId: leagueId,
  }) as any[] | undefined;
  const matches = useQuery(api.matches.getByLeague as any, { leagueId }) as any[] | undefined;

  const sports = getAllSports();
  const sportName = sports.find(s => s.id === league?.sportId)?.name ?? league?.sportId ?? "Unknown";

  const isLoading = league === undefined;

  const liveMatches = matches?.filter(m => m.status === "live") ?? [];
  const scheduledMatches = matches?.filter(m => m.status === "scheduled") ?? [];
  const completedMatches = matches?.filter(m => m.status === "finished") ?? [];

  const progress = matches && matches.length > 0 
    ? Math.round((completedMatches.length / matches.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!league) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">League not found</h3>
            <p className="text-muted-foreground mb-4">This league may have been deleted or doesn't exist.</p>
            <Link href="/app/leagues">
              <Button>Back to Leagues</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <FadeIn>
                <Link
                  href="/app/leagues"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Leagues
                </Link>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {league.status === "active" ? (
                    <Badge className="bg-green-500">
                      <Activity className="w-3 h-3 mr-1" />
                      ACTIVE
                    </Badge>
                  ) : league.status === "draft" ? (
                    <Badge variant="secondary">Draft</Badge>
                  ) : league.status === "completed" ? (
                    <Badge variant="outline" className="border-border">Completed</Badge>
                  ) : (
                    <Badge variant="secondary">{league.status ?? "Draft"}</Badge>
                  )}
                  <Badge className="bg-primary/20 text-primary border-0">{sportName}</Badge>
                  {league.type && (
                    <Badge variant="outline" className="capitalize">{league.type.replace("_", " ")}</Badge>
                  )}
                </div>
              </SlideIn>

              <SlideIn direction="up" delay={0.2}>
                <h1 className="text-section mb-3">{league.name}</h1>
                <p className="text-muted-foreground max-w-2xl">
                  {league.description ?? "No description provided."}
                </p>
              </SlideIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link href={`/app/leagues/${leagueId}/teams`}>
                    <Button variant="outline" className="border-border">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage Teams
                    </Button>
                  </Link>
                  <Link href="/app/print">
                    <Button variant="outline" className="border-border">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-4">
              <StaggerContainer className="grid grid-cols-2 gap-3">
                <StaggerItem>
                  <Card className="bg-card/50 border-border">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number">
                        <AnimatedNumber value={teams?.length ?? 0} />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Teams</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-card/50 border-border">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number text-primary">
                        <AnimatedNumber value={completedMatches.length} />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Played</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-card/50 border-border">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number text-red-500">
                        <AnimatedNumber value={liveMatches.length} />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Live</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-card/50 border-border">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number">
                        <AnimatedNumber value={matches?.length ?? 0} />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </div>

      {matches && matches.length > 0 && (
        <div className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Season Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {scheduledMatches.length} matches remaining
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Teams ({teams?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="matches">Matches ({matches?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {liveMatches.length > 0 && (
                  <Card className="border-red-500/50 bg-red-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                        Live Matches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {liveMatches.map((match) => (
                          <Link key={match._id} href={`/app/matches/${match.matchId}?sport=${match.sportId}`}>
                            <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                              <div>
                                <p className="font-medium">
                                  {match.team1?.name ?? "TBD"} vs {match.team2?.name ?? "TBD"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold font-display">
                                  {match.team1?.score ?? 0} - {match.team2?.score ?? 0}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Upcoming Matches
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scheduledMatches.length > 0 ? (
                      <div className="space-y-3">
                        {scheduledMatches.slice(0, 5).map((match) => (
                          <div key={match._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                            <div>
                              <p className="font-medium">
                                {match.team1?.name ?? "TBD"} vs {match.team2?.name ?? "TBD"}
                              </p>
                            </div>
                            <Badge variant="secondary">Scheduled</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No upcoming matches</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Recent Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {completedMatches.length > 0 ? (
                      <div className="space-y-3">
                        {completedMatches.slice(0, 5).map((match) => (
                          <Link key={match._id} href={`/app/matches/${match.matchId}?sport=${match.sportId}`}>
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <span className="font-medium">{match.team1?.name ?? "TBD"}</span>
                                <span className="text-xl font-bold">
                                  {match.team1?.score ?? 0} - {match.team2?.score ?? 0}
                                </span>
                                <span className="font-medium">{match.team2?.name ?? "TBD"}</span>
                              </div>
                              <Badge variant="outline" className="border-green-500/50 text-green-500">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Final
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No completed matches yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>League Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={league.status === "active" ? "default" : "secondary"}>
                          {league.status ?? "draft"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sport</span>
                        <span className="font-medium">{sportName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{league.type?.replace("_", " ") ?? "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teams</span>
                        <span className="font-medium">{teams?.length ?? 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href={`/app/leagues/${leagueId}/teams`} className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Shield className="w-4 h-4 mr-3 text-primary" />
                        Manage Teams
                      </Button>
                    </Link>
                    <Link href="/app/print" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <Printer className="w-4 h-4 mr-3 text-primary" />
                        Print Schedules
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Teams</span>
                  <Link href={`/app/leagues/${leagueId}/teams`}>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Manage Teams
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams && teams.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                      <Link key={team._id} href={`/app/leagues/${leagueId}/teams/${team.teamId}`}>
                        <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: team.color || "#3b82f6" }}
                              >
                                {(team.shortName ?? team.name ?? "T").charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{team.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {team.stats?.wins ?? 0}W - {team.stats?.losses ?? 0}L
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No teams registered</h3>
                    <p className="text-muted-foreground mb-4">Add teams to get started</p>
                    <Link href={`/app/leagues/${leagueId}/teams`}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Teams
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="mt-0">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>All Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {matches && matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <Link key={match._id} href={`/app/matches/${match.matchId}?sport=${match.sportId}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {match.status === "live" ? (
                                <Badge className="bg-red-500">
                                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                                  LIVE
                                </Badge>
                              ) : match.status === "finished" ? (
                                <Badge variant="outline" className="border-green-500/50 text-green-500">Finished</Badge>
                              ) : (
                                <Badge variant="secondary">Scheduled</Badge>
                              )}
                            </div>
                            <p className="font-medium">
                              {match.team1?.name ?? "TBD"} vs {match.team2?.name ?? "TBD"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold font-display">
                              {match.team1?.score ?? 0} - {match.team2?.score ?? 0}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No matches scheduled</h3>
                    <p className="text-muted-foreground">
                      Matches will appear here once teams are added and fixtures are generated
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
