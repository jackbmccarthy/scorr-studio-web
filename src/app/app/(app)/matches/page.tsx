// Matches List Page - View and Manage Matches

"use client";

import Link from "next/link";
import { Button, Card, CardContent, Badge, Input, Select, Label } from "@/components/ui";
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  Loader2,
  Play,
  Eye,
  Edit3,
  X,
  ChevronDown,
  Trophy,
  Users,
  Layers,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAllSports } from "@/lib/sports";
import { useTenant } from "@/components/tenant-provider";
import { motion, AnimatePresence } from "framer-motion";

export default function MatchesPage() {
  const { tenantId } = useTenant();
  const sports = getAllSports();

  const matches = useQuery(api.matches.getByTenant as any, { tenantId }) as any[] | undefined;
  const competitions = useQuery(api.competitions.list as any, { tenantId }) as any[] | undefined;
  const leagues = useQuery(api.leagues.list as any, { tenantId }) as any[] | undefined;
  
  const isLoading = matches === undefined;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [competitionFilter, setCompetitionFilter] = useState<string>("");
  const [leagueFilter, setLeagueFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const allMatches = matches ?? [];

  const filteredMatches = useMemo(() => {
    return allMatches.filter((match: any) => {
      const sportName = sports.find(s => s.id === match.sportId)?.name ?? match.sportId ?? "";
      const team1Name = match.team1?.name ?? "";
      const team2Name = match.team2?.name ?? "";
      
      const matchesSearch =
        team1Name.toLowerCase().includes(search.toLowerCase()) ||
        team2Name.toLowerCase().includes(search.toLowerCase()) ||
        sportName.toLowerCase().includes(search.toLowerCase()) ||
        (match.eventName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (match.matchRound ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !statusFilter || match.status === statusFilter;
      
      const matchesCompetition = !competitionFilter || match.competitionId === competitionFilter;
      
      const matchesLeague = !leagueFilter || match.leagueId === leagueFilter;

      return matchesSearch && matchesStatus && matchesCompetition && matchesLeague;
    });
  }, [allMatches, search, statusFilter, competitionFilter, leagueFilter, sports]);

  const statusCounts = useMemo(() => ({
    all: allMatches.length,
    live: allMatches.filter((m: any) => m.status === "live").length,
    scheduled: allMatches.filter((m: any) => m.status === "scheduled").length,
    finished: allMatches.filter((m: any) => m.status === "finished").length,
    archived: allMatches.filter((m: any) => m.status === "archived" || m.status === "cancelled").length,
  }), [allMatches]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setCompetitionFilter("");
    setLeagueFilter("");
  };

  const hasActiveFilters = search || statusFilter || competitionFilter || leagueFilter;

  const getMatchSportName = (match: any) => {
    const sport = sports.find(s => s.id === match.sportId);
    return sport?.name ?? match.sportId ?? "Unknown";
  };

  const getCompetitionName = (match: any) => {
    if (!match.competitionId || !competitions) return null;
    const comp = competitions.find((c: any) => c.competitionId === match.competitionId);
    return comp?.name ?? null;
  };

  const getLeagueName = (match: any) => {
    if (!match.leagueId || !leagues) return null;
    const league = leagues.find((l: any) => l.leagueId === match.leagueId);
    return league?.name ?? null;
  };

  const getMatchContext = (match: any) => {
    const parts: { label: string; icon: any; value: string }[] = [];
    
    const competitionName = getCompetitionName(match);
    if (competitionName) {
      parts.push({ label: "Competition", icon: Trophy, value: competitionName });
    }
    
    const leagueName = getLeagueName(match);
    if (leagueName) {
      parts.push({ label: "League", icon: Layers, value: leagueName });
    }
    
    if (match.seasonId) {
      parts.push({ label: "Season", icon: Calendar, value: match.seasonId });
    }
    
    if (match.divisionId) {
      parts.push({ label: "Division", icon: Users, value: match.divisionId });
    }
    
    if (match.matchRound) {
      parts.push({ label: "Round", icon: Filter, value: match.matchRound });
    }
    
    if (match.eventName && !competitionName) {
      parts.push({ label: "Event", icon: Trophy, value: match.eventName });
    }
    
    if (match.courtName) {
      parts.push({ label: "Court", icon: Filter, value: match.courtName });
    }
    
    return parts;
  };

  const getMatchAction = (match: any) => {
    switch (match.status) {
      case "live":
        return { label: "Continue Scoring", icon: Play, variant: "default" as const };
      case "scheduled":
        return { label: "Edit / Start", icon: Edit3, variant: "outline" as const };
      case "finished":
        return { label: "View", icon: Eye, variant: "ghost" as const };
      case "archived":
      case "cancelled":
        return { label: "View", icon: Eye, variant: "ghost" as const };
      default:
        return { label: "View", icon: Eye, variant: "ghost" as const };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your matches
          </p>
        </div>
        <Link href="/app/print">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Print Schedules
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 mb-6">
        {/* Primary Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by team/player name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
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
                {[search, statusFilter, competitionFilter, leagueFilter].filter(Boolean).length}
              </Badge>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            All ({statusCounts.all})
          </Button>
          <Button
            variant={statusFilter === "live" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("live")}
            className="gap-2"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live ({statusCounts.live})
          </Button>
          <Button
            variant={statusFilter === "scheduled" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("scheduled")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled ({statusCounts.scheduled})
          </Button>
          <Button
            variant={statusFilter === "finished" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("finished")}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finished ({statusCounts.finished})
          </Button>
          <Button
            variant={statusFilter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("archived")}
          >
            Archived ({statusCounts.archived})
          </Button>
        </div>

        {/* Expandable Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Competition / Event</Label>
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
                    <Label className="text-xs text-muted-foreground mb-1.5 block">League / Season</Label>
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

      {/* Matches List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-16 bg-muted rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-4 w-48 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-8 w-20 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "No matches have been created yet"}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Link href="/app/competitions">
                <Button>
                  <Trophy className="w-4 h-4 mr-2" />
                  Go to Competitions
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match: any) => {
            const contextParts = getMatchContext(match);
            const action = getMatchAction(match);
            
            return (
              <Link key={match._id} href={`/app/matches/${match.matchId}?sport=${match.sportId}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Status and Sport Row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {match.status === "live" ? (
                            <Badge className="bg-green-500">
                              <span className="animate-pulse mr-1">●</span> LIVE
                            </Badge>
                          ) : match.status === "scheduled" ? (
                            <Badge variant="secondary">Scheduled</Badge>
                          ) : match.status === "finished" ? (
                            <Badge variant="outline" className="border-green-500/50 text-green-600">Finished</Badge>
                          ) : match.status === "archived" ? (
                            <Badge variant="outline">Archived</Badge>
                          ) : (
                            <Badge variant="outline">Cancelled</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getMatchSportName(match)}
                          </Badge>
                        </div>

                        {/* Teams/Players */}
                        <p className="font-semibold text-lg truncate">
                          {match.team1?.name ?? "TBD"} vs {match.team2?.name ?? "TBD"}
                        </p>

                        {/* Match Context - Competition/League/Round etc. */}
                        {contextParts.length > 0 && (
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {contextParts.map((part, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                                <part.icon className="w-3 h-3" />
                                <span>{part.value}</span>
                                {idx < contextParts.length - 1 && (
                                  <span className="text-border mx-1">•</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Score and Action */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold font-display">
                            {match.team1?.score ?? 0} - {match.team2?.score ?? 0}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {match.scheduledStartTime
                              ? new Date(match.scheduledStartTime).toLocaleDateString()
                              : match.createdAt
                                ? new Date(match.createdAt).toLocaleDateString()
                                : "—"}
                          </p>
                        </div>
                        <Button
                          variant={action.variant}
                          size="sm"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <action.icon className="w-4 h-4 mr-2" />
                          {action.label}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
