"use client";

import { PrintLayout } from "./PrintLayout";

interface CourtMatch {
  id: string;
  court: string;
  time: string;
  sportName: string;
  team1: { name: string; score?: number };
  team2: { name: string; score?: number };
  status: string;
}

interface PrintableCourtAssignmentsProps {
  matches: CourtMatch[];
  tournamentName?: string;
  title?: string;
  qrUrl?: string;
  courts?: string[];
}

export function PrintableCourtAssignments({
  matches,
  tournamentName,
  title = "Court Assignments",
  qrUrl,
  courts,
}: PrintableCourtAssignmentsProps) {
  // Group matches by court
  const courtAssignments = matches.reduce((acc, match) => {
    const courtName = match.court || "Unassigned";
    if (!acc[courtName]) acc[courtName] = [];
    acc[courtName].push(match);
    return acc;
  }, {} as Record<string, CourtMatch[]>);

  // Sort matches by time within each court
  Object.keys(courtAssignments).forEach((court) => {
    courtAssignments[court].sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );
  });

  const courtNames = courts || Object.keys(courtAssignments).sort();

  return (
    <PrintLayout
      title={title}
      tournamentName={tournamentName}
      qrUrl={qrUrl}
      subtitle={`${courtNames.length} courts • ${matches.length} matches`}
    >
      <div className="space-y-8">
        {courtNames.map((court) => {
          const courtMatches = courtAssignments[court] || [];
          
          return (
            <div key={court} className="print-page-break-inside-avoid">
              <div className="bg-gray-100 border-l-4 border-black p-3 mb-3">
                <h3 className="text-xl font-bold text-black">{court}</h3>
                <p className="text-sm text-gray-600">
                  {courtMatches.length} match{courtMatches.length !== 1 ? "es" : ""} scheduled
                </p>
              </div>

              {courtMatches.length === 0 ? (
                <p className="text-sm text-gray-500 italic pl-3">
                  No matches scheduled
                </p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 uppercase">
                        Time
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 uppercase">
                        Match
                      </th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 uppercase">
                        Score
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courtMatches.map((match, index) => (
                      <tr 
                        key={match.id}
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">
                          {new Date(match.time).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-medium text-black">
                            {match.team1.name}
                            <span className="text-gray-600 mx-2">vs</span>
                            {match.team2.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {match.sportName}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-lg font-bold text-black">
                            {match.team1.score ?? "-"} - {match.team2.score ?? "-"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-sm font-medium ${
                            match.status === "live" 
                              ? "text-red-600" 
                              : match.status === "finished" 
                              ? "text-green-600"
                              : "text-gray-700"
                          }`}>
                            {match.status === "live" ? "● LIVE" : 
                             match.status === "finished" ? "✓ Final" : 
                             "○ Scheduled"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </PrintLayout>
  );
}
