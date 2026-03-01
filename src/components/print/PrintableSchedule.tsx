"use client";

import { PrintLayout } from "./PrintLayout";

interface Match {
  id: string;
  sportName: string;
  team1: { name: string; score?: number };
  team2: { name: string; score?: number };
  status: string;
  createdAt: string;
  court?: string;
  time?: string;
  eventName?: string;
  matchRound?: string;
}

interface PrintableScheduleProps {
  matches: Match[];
  tournamentName?: string;
  title?: string;
  qrUrl?: string;
  groupByDate?: boolean;
  groupByCourt?: boolean;
}

export function PrintableSchedule({
  matches,
  tournamentName,
  title = "Match Schedule",
  qrUrl,
  groupByDate = true,
}: PrintableScheduleProps) {
  // Group matches by date if requested
  const groupedMatches = groupByDate 
    ? matches.reduce((acc, match) => {
        const date = new Date(match.createdAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(match);
        return acc;
      }, {} as Record<string, Match[]>)
    : { "All Matches": matches };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return "● LIVE";
      case "finished":
        return "✓ Final";
      case "scheduled":
        return "○ Scheduled";
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PrintLayout
      title={title}
      tournamentName={tournamentName}
      qrUrl={qrUrl}
      subtitle={`${matches.length} matches`}
    >
      {Object.entries(groupedMatches).map(([date, dateMatches]) => (
        <div key={date} className="mb-8 print-page-break-inside-avoid">
          {groupByDate && (
            <h2 className="text-lg font-bold mb-3 text-black border-b border-gray-300 pb-2">
              {date}
            </h2>
          )}
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Time
                </th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Match
                </th>
                <th className="text-center py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sport
                </th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dateMatches.map((match, index) => (
                <tr 
                  key={match.id}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-2 text-sm font-medium text-gray-900">
                    {match.time || formatTime(match.createdAt)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm font-medium text-black">
                      {match.team1.name}
                      <span className="text-gray-600 mx-2">vs</span>
                      {match.team2.name}
                    </div>
                    {match.eventName && (
                      <div className="text-xs text-gray-500 mt-1">
                        {match.eventName}
                      </div>
                    )}
                    {match.matchRound && (
                      <div className="text-xs text-gray-500">
                        {match.matchRound}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-lg font-bold text-black">
                      {match.team1.score ?? "-"} - {match.team2.score ?? "-"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-700">
                    {match.sportName}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium">
                    <span className={`${
                      match.status === "live" 
                        ? "text-red-600 font-bold" 
                        : match.status === "finished" 
                        ? "text-gray-600"
                        : "text-gray-700"
                    }`}>
                      {getStatusBadge(match.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </PrintLayout>
  );
}
