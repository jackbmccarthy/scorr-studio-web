"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ScoreEntryForm } from "@/components/results/ScoreEntryForm";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function MatchResultPage() {
  const { id } = useParams();
  const matchId = id as string;

  // Assuming matches query exists
  const match = useQuery(api.matches.getByMatchId as any, { matchId }) as any;

  if (match === undefined) {
    return <div className="p-8"><Skeleton className="h-[400px] w-full max-w-2xl mx-auto" /></div>;
  }

  if (!match) {
    return <div className="p-8 text-center">Match not found</div>;
  }

  if (match.status === "finished") {
    // Maybe show the result instead of the form?
    // For now, let's just show form (maybe prefilled) or a message
    // return <div className="p-8 text-center">This match is already finished.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <ScoreEntryForm 
        matchId={matchId}
        competitionId={match.competitionId!}
        tenantId={match.tenantId}
        team1={{
          id: match.team1?.id || "team1",
          name: match.team1?.name || "Team 1"
        }}
        team2={{
          id: match.team2?.id || "team2",
          name: match.team2?.name || "Team 2"
        }}
      />
    </div>
  );
}
