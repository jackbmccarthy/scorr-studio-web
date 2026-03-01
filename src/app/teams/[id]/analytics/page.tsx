"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";

export default function TeamAnalyticsPage() {
  const { id } = useParams();
  const teamId = id as string;

  // Assuming we have a team details query
  const team = useQuery(api.teams.getTeam as any, { teamId }) as any;
  const stats = useQuery(api.analytics.getTeamAnalytics as any, { teamId }) as any[];
  const matches = useQuery(api.results.getResultsByTeam as any, { teamId }) as any[];

  if (team === undefined || stats === undefined) {
    return <div className="p-8 space-y-4"><Skeleton className="h-[200px] w-full" /></div>;
  }

  // Aggregate data for charts
  const winLossData = [
    { name: "Wins", value: stats?.reduce((acc, s) => acc + s.wins, 0) || 0, fill: "#22c55e" },
    { name: "Losses", value: stats?.reduce((acc, s) => acc + s.losses, 0) || 0, fill: "#ef4444" },
    { name: "Draws", value: stats?.reduce((acc, s) => acc + s.draws, 0) || 0, fill: "#94a3b8" },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {team?.logoUrl && (
          <img src={team.logoUrl} alt={team.name} className="h-24 w-24 rounded-full border-4 border-border/50" />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team?.name || "Team"} Analytics</h1>
          <p className="text-muted-foreground">Comprehensive team statistics and performance history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Record Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center py-4">
              {winLossData[0].value}-{winLossData[1].value}-{winLossData[2].value}
            </div>
            <div className="text-center text-sm text-muted-foreground">W-L-D</div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple list of recent matches */}
            <div className="space-y-2">
              {matches?.slice(0, 5).map(m => (
                <div key={m.matchId} className="flex justify-between items-center p-2 rounded bg-secondary/10">
                  <span className="text-sm text-muted-foreground">{new Date(m.completedAt).toLocaleDateString()}</span>
                  <div className="font-semibold">
                    {m.winner.teamId === teamId ? "WON" : "LOST"} vs {m.winner.teamId === teamId ? m.loser?.teamName : m.winner.teamName}
                  </div>
                  <div className="font-mono text-sm">
                    {m.scores.map((s: any) => `${s.team1Score}-${s.team2Score}`).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsChart 
          title="Win Distribution" 
          data={winLossData} 
        />
        {/* Could add another chart for points scored over time */}
      </div>
    </div>
  );
}
