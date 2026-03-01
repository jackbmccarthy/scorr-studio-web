"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, CardContent, Badge, Input, Select, Label } from "@/components/ui";
import {
  Search,
  Users,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Shield,
  ChevronDown,
  X,
  Eye,
  Trophy,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";
import { useTenant } from "@/components/tenant-provider";

export default function TeamsPage() {
  const { tenantId } = useTenant();
  const teams = useQuery(api.teams.list as any, { tenantId }) as any[] | undefined;
  const competitions = useQuery(api.competitions.list as any, { tenantId }) as any[] | undefined;
  const leagues = useQuery(api.leagues.list as any, { tenantId }) as any[] | undefined;
  const isLoading = teams === undefined;

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [competitionFilter, setCompetitionFilter] = useState<string>("");
  const [leagueFilter, setLeagueFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const allTeams = teams ?? [];

  const filteredTeams = allTeams.filter((team: any) => {
    const matchesSearch =
      (team.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (team.shortName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCompetition = !competitionFilter || team.competitionId === competitionFilter;
    const matchesLeague = !leagueFilter || team.leagueId === leagueFilter;
    return matchesSearch && matchesCompetition && matchesLeague;
  });

  const hasActiveFilters = search || competitionFilter || leagueFilter;

  const clearFilters = () => {
    setSearch("");
    setCompetitionFilter("");
    setLeagueFilter("");
  };

  const totalTeams = allTeams.length;
  const totalPlayers = allTeams.reduce((acc: number, team: any) => acc + (team.players?.length ?? 0), 0);
  const checkedInCount = allTeams.filter((t: any) => t.checkedIn).length;

  const getTeamContext = (team: any) => {
    if (team.competitionId && competitions) {
      const comp = competitions.find((c: any) => c.competitionId === team.competitionId);
      if (comp) return { type: "competition" as const, name: comp.name, id: team.competitionId };
    }
    if (team.leagueId && leagues) {
      const league = leagues.find((l: any) => l.leagueId === team.leagueId);
      if (league) return { type: "league" as const, name: league.name, id: team.leagueId };
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Team Lookup
                  </span>
                </div>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <h1 className="text-hero mb-4">
                  <span className="gradient-text">TEAMS</span>
                </h1>
              </SlideIn>

              <FadeIn delay={0.3}>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Search and view teams across all your competitions and leagues. 
                  Edit teams within their respective competition or league context.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-5">
              <StaggerContainer className="grid grid-cols-3 gap-3">
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number text-primary">
                      <AnimatedNumber value={totalTeams} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Teams</p>
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
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number text-green-500">
                      <AnimatedNumber value={checkedInCount} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Checked In</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/4 h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary to-transparent" />
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teams by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-card border-border"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {[search, competitionFilter, leagueFilter].filter(Boolean).length}
                </Badge>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 px-3">
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 px-3">
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="mt-4 p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Competition</Label>
                    <Select
                      value={competitionFilter}
                      onValueChange={setCompetitionFilter}
                    >
                      <option value="">All Competitions</option>
                      {competitions?.map((comp: any) => (
                        <option key={comp.competitionId} value={comp.competitionId}>
                          {comp.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">League</Label>
                    <Select
                      value={leagueFilter}
                      onValueChange={setLeagueFilter}
                    >
                      <option value="">All Leagues</option>
                      {leagues?.map((league: any) => (
                        <option key={league.leagueId} value={league.leagueId}>
                          {league.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Teams Grid/List */}
      <div className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted" />
                      <div className="space-y-1">
                        <div className="h-5 w-32 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-muted rounded" />
                      <div className="h-16 bg-muted rounded" />
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No teams found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your search or filters"
                    : "Teams are created within competitions and leagues"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team: any) => {
              const context = getTeamContext(team);
              const editHref = context?.type === "competition"
                ? `/app/competitions/${context.id}/teams/${team.teamId}`
                : context?.type === "league"
                  ? `/app/leagues/${context.id}/teams/${team.teamId}`
                  : null;

              return (
                <StaggerItem key={team._id}>
                  <Card className="group h-full transition-all hover:scale-[1.02] hover:border-primary">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: team.color || "#3b82f6" }}
                          >
                            {(team.shortName ?? team.name ?? "T").charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold group-hover:text-primary transition-colors">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">{team.shortName ?? ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {team.seed && (
                            <Badge variant="outline" className="border-primary/30 text-primary">#{team.seed}</Badge>
                          )}
                          {team.checkedIn && (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">✓</Badge>
                          )}
                        </div>
                      </div>

                      {/* Context Badge */}
                      {context && (
                        <div className="mb-3">
                          <Link 
                            href={context.type === "competition" ? `/app/competitions/${context.id}` : `/app/leagues/${context.id}`}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {context.type === "competition" ? (
                              <Trophy className="w-3 h-3" />
                            ) : (
                              <Calendar className="w-3 h-3" />
                            )}
                            {context.name}
                          </Link>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 rounded bg-muted">
                          <p className="text-lg font-bold text-green-500">{team.stats?.wins ?? 0}</p>
                          <p className="text-xs text-muted-foreground">Wins</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted">
                          <p className="text-lg font-bold text-red-500">{team.stats?.losses ?? 0}</p>
                          <p className="text-xs text-muted-foreground">Losses</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted">
                          <p className="text-lg font-bold">{team.players?.length ?? 0}</p>
                          <p className="text-xs text-muted-foreground">Players</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {(team.players ?? []).slice(0, 3).map((player: any) => (
                          <div key={player.playerId} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground truncate">
                              {player.isCaptain && <span className="text-primary mr-1">©</span>}
                              {player.name}
                            </span>
                            {player.number && (
                              <span className="text-muted-foreground font-mono text-xs">#{player.number}</span>
                            )}
                          </div>
                        ))}
                        {(team.players?.length ?? 0) > 3 && (
                          <p className="text-xs text-muted-foreground">+{team.players.length - 3} more</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Link href={`/app/teams/${team.teamId}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        {editHref && (
                          <Link href={editHref} className="flex-1">
                            <Button size="sm" className="w-full gap-2">
                              Edit
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Team</th>
                    <th className="p-4 font-medium">Context</th>
                    <th className="p-4 font-medium text-center">Seed</th>
                    <th className="p-4 font-medium text-center">W-L-D</th>
                    <th className="p-4 font-medium text-center">Players</th>
                    <th className="p-4 font-medium text-center">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team: any, index: number) => {
                    const context = getTeamContext(team);
                    const editHref = context?.type === "competition"
                      ? `/app/competitions/${context.id}/teams/${team.teamId}`
                      : context?.type === "league"
                        ? `/app/leagues/${context.id}/teams/${team.teamId}`
                        : null;

                    return (
                      <motion.tr
                        key={team._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: team.color || "#3b82f6" }}
                            >
                              {(team.shortName ?? team.name ?? "T").charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">{team.shortName ?? ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {context && (
                            <Link 
                              href={context.type === "competition" ? `/app/competitions/${context.id}` : `/app/leagues/${context.id}`}
                              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {context.type === "competition" ? (
                                <Trophy className="w-3 h-3" />
                              ) : (
                                <Calendar className="w-3 h-3" />
                              )}
                              {context.name}
                            </Link>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {team.seed ? (
                            <Badge variant="outline" className="border-primary/30 text-primary">#{team.seed}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-mono">
                            <span className="text-green-500">{team.stats?.wins ?? 0}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-red-500">{team.stats?.losses ?? 0}</span>
                            <span className="text-muted-foreground">-</span>
                            <span>{team.stats?.draws ?? 0}</span>
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{team.players?.length ?? 0}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {team.checkedIn ? (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Checked In</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/app/teams/${team.teamId}`}>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {editHref && (
                              <Link href={editHref}>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  Edit
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
