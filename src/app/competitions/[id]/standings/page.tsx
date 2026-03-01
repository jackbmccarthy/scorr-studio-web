"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { StandingsTable } from "@/components/analytics/StandingsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function CompetitionStandingsPage() {
  const { id } = useParams();
  const competitionId = id as string;

  const stats = useQuery(api.analytics.getCompetitionStats as any, { competitionId });
  const competition = useQuery(api.competitions.getById as any, { competitionId }) as any; // Assuming get query exists

  if (stats === undefined) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-[400px] w-full" />
    </div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {competition?.name ? `${competition.name} Standings` : "League Standings"}
        </h1>
        <p className="text-muted-foreground">Current rankings and team statistics.</p>
      </div>

      {stats ? (
        <StandingsTable stats={stats.teamStats} />
      ) : (
        <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-lg border border-border/50">
          No standings data available yet.
        </div>
      )}
    </div>
  );
}
