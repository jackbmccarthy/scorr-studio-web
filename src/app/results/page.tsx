"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ResultCard } from "@/components/results/ResultCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsPage() {
  const tenantId = "demo-tenant"; // Placeholder
  
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const results = useQuery(api.results.getRecentResults as any, { tenantId, limit: 50 });
  const competitions = useQuery(api.competitions.list as any, { tenantId }) as any[]; 

  const filteredResults = results?.filter((r: any) => {
    if (filter !== "all" && r.competitionId !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.winner.teamName.toLowerCase().includes(s) || 
        r.loser?.teamName.toLowerCase().includes(s) ||
        r.notes?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Results</h1>
          <p className="text-muted-foreground">Recent scores and outcomes from all competitions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/50 p-4 rounded-lg border border-border/50">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search teams..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Competitions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Competitions</SelectItem>
            {competitions?.map(c => (
              <SelectItem key={c._id} value={c.competitionId}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results === undefined ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))
        ) : filteredResults?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No results found matching your criteria.
          </div>
        ) : (
          filteredResults?.map((result: any) => {
            // Calculate total score (sets won)
            const team1Sets = result.scores.reduce((acc: any, s: any) => acc + (s.team1Score > s.team2Score ? 1 : 0), 0);
            const team2Sets = result.scores.reduce((acc: any, s: any) => acc + (s.team2Score > s.team1Score ? 1 : 0), 0);

            return (
              <ResultCard 
                key={result.resultId}
                match={{
                  matchId: result.matchId,
                  team1: { 
                    name: result.team1?.teamName || "Team 1",
                    score: team1Sets,
                    logoUrl: result.team1?.logoUrl
                  },
                  team2: {
                    name: result.team2?.teamName || "Team 2",
                    score: team2Sets,
                    logoUrl: result.team2?.logoUrl
                  },
                  completedAt: result.completedAt,
                  verified: result.verified,
                  scores: result.scores,
                  winner: result.winner
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
