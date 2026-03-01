"use client";

import { PrintLayout } from "./PrintLayout";

interface BracketMatch {
  id: string;
  team1?: { name: string; score?: number };
  team2?: { name: string; score?: number };
  winner?: string;
  round: string;
  roundIndex: number;
  matchIndex: number;
  status: string;
}

interface PrintableBracketProps {
  matches: BracketMatch[];
  tournamentName?: string;
  title?: string;
  qrUrl?: string;
  bracketType?: "single" | "double";
}

export function PrintableBracket({
  matches,
  tournamentName,
  title = "Tournament Bracket",
  qrUrl,
  bracketType = "single",
}: PrintableBracketProps) {
  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    const roundName = match.round || `Round ${match.roundIndex + 1}`;
    if (!acc[roundName]) acc[roundName] = [];
    acc[roundName].push(match);
    return acc;
  }, {} as Record<string, BracketMatch[]>);

  const roundNames = Object.keys(rounds);

  return (
    <PrintLayout
      title={title}
      tournamentName={tournamentName}
      qrUrl={qrUrl}
      subtitle={bracketType === "double" ? "Double Elimination" : "Single Elimination"}
    >
      <div className="space-y-6">
        {roundNames.map((roundName) => (
          <div key={roundName} className="print-page-break-inside-avoid">
            <h3 className="text-lg font-bold mb-3 text-black border-b border-gray-300 pb-2">
              {roundName}
            </h3>
            <div className="grid gap-3">
              {rounds[roundName]
                .sort((a, b) => a.matchIndex - b.matchIndex)
                .map((match) => (
                  <div
                    key={match.id}
                    className="border border-gray-300 rounded p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        Match {match.matchIndex + 1}
                      </span>
                      <span className={`text-xs font-medium ${
                        match.status === "live" 
                          ? "text-red-600" 
                          : "text-gray-600"
                      }`}>
                        {match.status === "live" ? "● LIVE" : match.status}
                      </span>
                    </div>
                    
                    {/* Team 1 */}
                    <div className={`flex justify-between items-center py-2 px-3 mb-1 ${
                      match.winner === "team1" 
                        ? "bg-green-100 border-l-4 border-green-600" 
                        : "bg-gray-50"
                    }`}>
                      <span className="font-medium text-black">
                        {match.team1?.name || "TBD"}
                      </span>
                      <span className="text-lg font-bold text-black">
                        {match.team1?.score ?? "-"}
                      </span>
                    </div>
                    
                    <div className="text-center text-xs text-gray-500 py-1">
                      vs
                    </div>
                    
                    {/* Team 2 */}
                    <div className={`flex justify-between items-center py-2 px-3 ${
                      match.winner === "team2" 
                        ? "bg-green-100 border-l-4 border-green-600" 
                        : "bg-gray-50"
                    }`}>
                      <span className="font-medium text-black">
                        {match.team2?.name || "TBD"}
                      </span>
                      <span className="text-lg font-bold text-black">
                        {match.team2?.score ?? "-"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </PrintLayout>
  );
}
