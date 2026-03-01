"use client";

import Link from "next/link";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { EmptyCompetitions } from "@/components/ui/empty-state";
import {
  Plus,
  Search,
  Trophy,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Activity,
  Flame,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber, Pulse } from "@/components/motion";
import { useTenant } from "@/components/tenant-provider";

export default function CompetitionsPage() {
  const { tenantId } = useTenant();
  const competitions = useQuery(api.competitions.list as any, { tenantId }) as any[] | undefined;
  const isLoading = competitions === undefined;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const allCompetitions = competitions ?? [];

  const filteredCompetitions = allCompetitions.filter((comp: any) => {
    const matchesSearch =
      (comp.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (comp.sportId ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (comp.venueName ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || comp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: allCompetitions.length,
    live: allCompetitions.filter((c: any) => c.status === "live").length,
    upcoming: allCompetitions.filter((c: any) => c.status === "upcoming" || c.status === "draft").length,
    completed: allCompetitions.filter((c: any) => c.status === "completed").length,
  };

  const liveCount = statusCounts.live;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            {/* Left - Typography */}
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="flex items-center gap-3 mb-4">
                  {liveCount > 0 && (
                    <>
                      <Pulse>
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      </Pulse>
                      <span className="text-sm font-medium text-red-500 uppercase tracking-wider">
                        {liveCount} Live Now
                      </span>
                    </>
                  )}
                </div>
              </FadeIn>

              <SlideIn direction="up" delay={0.1}>
                <h1 className="text-hero mb-4">
                  <span className="gradient-text">COMPETITIONS</span>
                </h1>
              </SlideIn>

              <FadeIn delay={0.3}>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Manage tournaments, leagues, and championship events with professional brackets and live scoring.
                </p>
              </FadeIn>
            </div>

            {/* Right - Stats */}
            <div className="lg:col-span-5">
              <StaggerContainer className="grid grid-cols-3 gap-3">
                <StaggerItem>
                  <div className="text-center p-4 rounded-lg border border-border bg-card/50">
                    <div className="stat-number text-primary">
                      <AnimatedNumber value={statusCounts.live} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Live</p>
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
                    <div className="stat-number">
                      <AnimatedNumber value={statusCounts.all} />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total</p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute top-0 right-0 w-1/4 h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-primary to-transparent" />
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search competitions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[
                { key: null, label: "All" },
                { key: "live", label: "Live", icon: Flame },
                { key: "upcoming", label: "Upcoming" },
                { key: "completed", label: "Done" },
              ].map((filter) => (
                <Button
                  key={filter.label}
                  variant={statusFilter === filter.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(filter.key)}
                  className={statusFilter === filter.key && filter.key === "live" ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  {filter.icon && <filter.icon className="w-4 h-4 mr-1.5" />}
                  {filter.label}
                </Button>
              ))}
            </div>
            <Link href="/app/competitions/new">
              <Button className="glow-accent">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Competitions Grid */}
      <div className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-14 bg-muted rounded" />
                      <div className="h-5 w-20 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-1.5 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCompetitions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <EmptyCompetitions />
            </CardContent>
          </Card>
        ) : (
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompetitions.map((competition: any) => (
              <StaggerItem key={competition._id}>
                <Link href={`/app/competitions/${competition.competitionId ?? competition._id}`}>
                  <Card className={`group h-full transition-all hover:scale-[1.02] hover:border-primary cursor-pointer ${
                    competition.status === "live" ? "border-red-500/30" : "border-border"
                  }`}>
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {competition.status === "live" ? (
                            <Badge className="bg-red-500 glow-live">
                              <Activity className="w-3 h-3 mr-1 animate-pulse" />
                              LIVE
                            </Badge>
                          ) : competition.status === "upcoming" || competition.status === "draft" ? (
                            <Badge variant="secondary">Upcoming</Badge>
                          ) : (
                            <Badge variant="outline" className="border-border">Completed</Badge>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {competition.name}
                      </h3>

                      {/* Sport Badge */}
                      <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                        {competition.sportId ?? "General"}
                      </Badge>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {(competition.startDate || competition.endDate) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {competition.startDate ? new Date(competition.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                              {competition.endDate && (
                                <> - {new Date(competition.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                              )}
                            </span>
                          </div>
                        )}
                        {competition.venueName && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="truncate">{competition.venueName}</span>
                          </div>
                        )}
                      </div>
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
