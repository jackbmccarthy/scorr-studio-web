"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Activity, ArrowUp, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsDashboard() {
  const tenantId = "demo-tenant";
  // Assuming we have a competitionId context or default
  // For demo, we might pick the first active competition
  const competitions = useQuery(api.competitions.list as any, { tenantId }) as any[];
  const activeCompetitionId = competitions?.[0]?.competitionId;

  const stats = useQuery(api.analytics.getCompetitionStats as any, activeCompetitionId ? { competitionId: activeCompetitionId } : "skip");
  const trending = useQuery(api.analytics.getTrendingTeams as any, activeCompetitionId ? { competitionId: activeCompetitionId } : "skip");
  const upsets = useQuery(api.analytics.getUpsets as any, activeCompetitionId ? { competitionId: activeCompetitionId } : "skip");

  if (!stats) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-[200px] w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>;
  }

  // Transform stats for charts
  const winData = stats.teamStats
    .sort((a: any, b: any) => b.wins - a.wins)
    .slice(0, 10)
    .map((s: any) => ({
      name: s.teamName,
      value: s.wins
    }));

  const pointsData = stats.teamStats
    .sort((a: any, b: any) => b.pointsFor - a.pointsFor)
    .slice(0, 10)
    .map((s: any) => ({
      name: s.teamName,
      value: s.pointsFor
    }));

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Performance insights for {competitions?.[0]?.name}.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Team</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamStats[0]?.teamName || "-"}</div>
            <p className="text-xs text-muted-foreground">
              {stats.teamStats[0]?.wins || 0} wins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Total matches is sum of wins + draws / 2? No. sum of (wins + losses + draws) / 2 */}
            <div className="text-2xl font-bold">
              {Math.floor(stats.teamStats.reduce((acc: number, t: any) => acc + t.wins + t.losses + t.draws, 0) / 2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending Up</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trending?.[0]?.teamName || "-"}</div>
            <p className="text-xs text-muted-foreground">
              {trending?.[0]?.currentStreak} game win streak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biggest Upset</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upsets?.[0]?.winner.teamName || "-"}</div>
            <p className="text-xs text-muted-foreground">
              Defeated #{upsets?.[0]?.loserSeed} seed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart 
          title="Most Wins" 
          description="Top 10 teams by total wins"
          data={winData} 
        />
        <AnalyticsChart 
          title="Top Scorers" 
          description="Top 10 teams by points scored"
          data={pointsData} 
        />
      </div>
    </div>
  );
}
