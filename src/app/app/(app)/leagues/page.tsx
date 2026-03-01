"use client";

import Link from "next/link";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { EmptyLeagues } from "@/components/ui/empty-state";
import {
  Plus,
  Search,
  Users,
  Calendar,
  MapPin,
  BarChart3,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber, Pulse } from "@/components/motion";
import { useTenant } from "@/components/tenant-provider";

export default function LeaguesPage() {
  const { tenantId } = useTenant();
  const leagues = useQuery(api.leagues.list as any, { tenantId }) as any[] | undefined;
  const isLoading = leagues === undefined;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const allLeagues = leagues ?? [];

  const filteredLeagues = allLeagues.filter((league: any) => {
    const matchesSearch =
      (league.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (league.sportId ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || league.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: allLeagues.length,
    active: allLeagues.filter((l: any) => l.status === "active").length,
    upcoming: allLeagues.filter((l: any) => l.status === "upcoming" || l.status === "draft" || !l.status).length,
    completed: allLeagues.filter((l: any) => l.status === "completed").length,
  };

  const activeCount = statusCounts.active;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="flex items-center gap-3 mb-4">
                  {activeCount > 0 && (
                    <>
                      <Pulse>
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </Pulse>
                      <span className="text-sm font-medium text-green-500 uppercase tracking-wider">
                        {activeCount} Active Leagues
                      </span>
                    </>
                  )}
                </div>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <h1 className="text-hero mb-4">
                  <span className="gradient-text">LEAGUES</span>
                </h1>
              </SlideIn>

              <FadeIn delay={0.3}>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Season-long competitions with standings, fixtures, and championship playoffs.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-5">
              <StaggerContainer className="grid grid-cols-3 gap-3">
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number text-green-500">
                      <AnimatedNumber value={statusCounts.active} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number">
                      <AnimatedNumber value={statusCounts.upcoming} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Upcoming</p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number text-green-500">
                      <AnimatedNumber value={statusCounts.completed} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Done</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leagues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[
                { key: null, label: "All" },
                { key: "active", label: "Active" },
                { key: "upcoming", label: "Upcoming" },
                { key: "completed", label: "Done" },
              ].map((filter) => (
                <Button
                  key={filter.label}
                  variant={statusFilter === filter.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(filter.key)}
                  className={statusFilter === filter.key && filter.key === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <Link href="/app/leagues/new">
              <Button className="glow-accent">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Leagues Grid */}
      <div className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-2 bg-muted rounded-full" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLeagues.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <EmptyLeagues />
            </CardContent>
          </Card>
        ) : (
          <StaggerContainer className="grid md:grid-cols-2 gap-4">
            {filteredLeagues.map((league: any) => (
              <StaggerItem key={league._id}>
                <Link href={`/app/leagues/${league.leagueId ?? league._id}`}>
                  <Card className={`group h-full transition-all hover:scale-[1.02] hover:border-primary cursor-pointer ${
                    league.status === "active" ? "border-green-500/30" : "border-border"
                  }`}>
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {league.status === "active" ? (
                            <Badge className="bg-green-500">
                              <Activity className="w-3 h-3 mr-1 animate-pulse" />
                              ACTIVE
                            </Badge>
                          ) : league.status === "upcoming" || league.status === "draft" || !league.status ? (
                            <Badge variant="secondary">Upcoming</Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-500/50 text-green-500">Completed</Badge>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {league.name}
                      </h3>

                      <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                        {league.sportId ?? "General"}
                      </Badge>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {league.type && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="capitalize">{league.type.replace(/_/g, " ")}</span>
                          </div>
                        )}
                        {league.createdAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {new Date(league.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        )}
                      </div>

                      {league.description && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {league.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
