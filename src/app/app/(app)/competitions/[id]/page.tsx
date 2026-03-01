"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  MapPin,
  Settings,
  Printer,
  Share2,
  Plus,
  Edit,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  Grid3X3,
  MapPinned,
  Shield,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { getAllSports } from "@/lib/sports";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";

export default function CompetitionDetailPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  const competition = useQuery(api.competitions.getById as any, { competitionId }) as any;
  const teams = useQuery(api.teams.list as any, { 
    tenantId: competition?.tenantId, 
    competitionId 
  }) as any[] | undefined;
  const matches = useQuery(api.matches.getByCompetition as any, { competitionId }) as any[] | undefined;

  const sports = getAllSports();
  const sportName = sports.find(s => s.id === competition?.sportId)?.name ?? competition?.sportId ?? "Unknown";
  
  const isLoading = competition === undefined;
  
  const liveMatches = matches?.filter(m => m.status === "live") ?? [];
  const scheduledMatches = matches?.filter(m => m.status === "scheduled") ?? [];
  const completedMatches = matches?.filter(m => m.status === "finished") ?? [];
  const checkedInTeams = teams?.filter(t => t.checkedIn) ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Competition not found</h3>
            <p className="text-muted-foreground mb-4">This competition may have been deleted or doesn't exist.</p>
            <Link href="/app/competitions">
              <Button>Back to Competitions</Button>
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
                  href="/app/competitions"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Competitions
                </Link>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {competition.status === "live" ? (
                    <Badge className="bg-red-500">
                      <Activity className="w-3 h-3 mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                  ) : competition.status === "active" ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : competition.status === "draft" ? (
                    <Badge variant="secondary">Draft</Badge>
                  ) : competition.status === "completed" ? (
                    <Badge variant="outline" className="border-border">Completed</Badge>
                  ) : (
                    <Badge variant="secondary">{competition.status}</Badge>
                  )}
                  <Badge className="bg-primary/20 text-primary border-0">{sportName}</Badge>
                </div>
              </SlideIn>

              <SlideIn direction="up" delay={0.2}>
                <h1 className="text-section mb-3">{competition.name}</h1>
                <p className="text-muted-foreground max-w-2xl">
                  {competition.description ?? "No description provided."}
                </p>
              </SlideIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link href={`/app/competitions/${competitionId}/teams`}>
                    <Button variant="outline" className="border-border">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage Teams
                    </Button>
                  </Link>
                  <Link href={`/app/competitions/${competitionId}/schedule`}>
                    <Button variant="outline" className="border-border">
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </Link>
                  <Link href={`/app/competitions/${competitionId}/courts`}>
                    <Button variant="outline" className="border-border">
                      <MapPinned className="w-4 h-4 mr-2" />
                      Courts
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
                      <div className="stat-number text-primary">
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
                        <AnimatedNumber value={teams?.length ?? 0} />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Teams</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-card/50 border-border">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number text-green-500">
                        <AnimatedNumber value={completedMatches.length} />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Completed</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-card/50 border-border">
                    <CardContent className="p-4 text-center">
                      <div className="stat-number">
                        <AnimatedNumber value={matches?.length ?? 0} />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Matches</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </div>

      {(competition.startDate || competition.endDate || competition.venueName) && (
        <div className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {competition.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    {competition.startDate}
                    {competition.endDate && ` - ${competition.endDate}`}
                  </span>
                </div>
              )}
              {competition.venueName && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{competition.venueName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>{checkedInTeams.length}/{teams?.length ?? 0} teams checked in</span>
              </div>
            </div>
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
                <SlideIn direction="up">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Link href={`/app/competitions/${competitionId}/teams`}>
                        <Button className="w-full justify-start" variant="outline">
                          <Shield className="w-4 h-4 mr-3 text-primary" />
                          Manage Teams & Registration
                        </Button>
                      </Link>
                      <Link href={`/app/competitions/${competitionId}/schedule`}>
                        <Button className="w-full justify-start" variant="outline">
                          <Grid3X3 className="w-4 h-4 mr-3 text-primary" />
                          Schedule & Courts
                        </Button>
                      </Link>
                      <Link href="/app/print">
                        <Button className="w-full justify-start" variant="outline">
                          <Printer className="w-4 h-4 mr-3 text-primary" />
                          Print Schedules
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </SlideIn>

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
                        {liveMatches.slice(0, 3).map((match) => (
                          <Link key={match._id} href={`/app/matches/${match.matchId}?sport=${match.sportId}`}>
                            <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                              <div>
                                <p className="font-medium">
                                  {match.team1?.name ?? "TBD"} vs {match.team2?.name ?? "TBD"}
                                </p>
                                {match.matchRound && (
                                  <p className="text-xs text-muted-foreground">{match.matchRound}</p>
                                )}
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

                {scheduledMatches.length > 0 && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          Upcoming Matches
                        </span>
                        <Link href={`/app/competitions/${competitionId}/schedule`}>
                          <Button variant="ghost" size="sm">
                            View All
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {scheduledMatches.slice(0, 5).map((match) => (
                          <div key={match._id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                            <div>
                              <p className="font-medium">
                                {match.team1?.name ?? "TBD"} vs {match.team2?.name ?? "TBD"}
                              </p>
                              {match.matchRound && (
                                <p className="text-xs text-muted-foreground">{match.matchRound}</p>
                              )}
                            </div>
                            <Badge variant="secondary">Scheduled</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <SlideIn direction="right" delay={0.2}>
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Competition Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={competition.status === "live" ? "default" : "secondary"}>
                            {competition.status ?? "draft"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sport</span>
                          <span className="font-medium">{sportName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Teams</span>
                          <span className="font-medium">{teams?.length ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Checked In</span>
                          <span className="font-medium text-green-500">{checkedInTeams.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SlideIn>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Registered Teams</span>
                  <Link href={`/app/competitions/${competitionId}/teams`}>
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
                      <Link key={team._id} href={`/app/competitions/${competitionId}/teams/${team.teamId}`}>
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
                                  {team.players?.length ?? 0} players
                                </p>
                              </div>
                              {team.checkedIn && (
                                <Badge className="bg-green-500/20 text-green-500">Checked In</Badge>
                              )}
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
                    <Link href={`/app/competitions/${competitionId}/teams`}>
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
                <CardTitle className="flex items-center justify-between">
                  <span>Matches</span>
                  <Link href={`/app/competitions/${competitionId}/schedule`}>
                    <Button variant="outline" size="sm">
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Full Schedule
                    </Button>
                  </Link>
                </CardTitle>
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
                              {match.matchRound && (
                                <span className="text-xs text-muted-foreground">{match.matchRound}</span>
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
                    <p className="text-muted-foreground mb-4">
                      Generate a bracket or create matches manually
                    </p>
                    <Link href={`/app/competitions/${competitionId}/schedule`}>
                      <Button>
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Go to Schedule
                      </Button>
                    </Link>
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
