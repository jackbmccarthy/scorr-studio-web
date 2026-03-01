"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Mock data - replace with Convex subscription
const mockMatch = {
  team1: {
    name: "Lakers",
    score: 98,
    logo: null,
  },
  team2: {
    name: "Celtics",
    score: 102,
    logo: null,
  },
  status: "live",
  period: "Q4",
  time: "2:34",
  sport: "Basketball",
};

export default function LiveDisplayPage() {
  const params = useParams();
  const displayId = params.id as string;

  const [match, setMatch] = useState(mockMatch);

  // TODO: Subscribe to Convex for real-time updates
  useEffect(() => {
    // Set up real-time subscription
    console.log("Subscribing to display:", displayId);
  }, [displayId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* Scoreboard */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          {/* Header */}
          <div className="bg-gray-800/50 px-8 py-3 flex items-center justify-between">
            <div className="text-gray-400 text-sm font-medium">{match.sport}</div>
            <div className="flex items-center gap-2">
              {match.status === "live" && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-500 text-sm font-bold">LIVE</span>
                </>
              )}
            </div>
          </div>

          {/* Main Score Area */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Team 1 */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">{match.team1.name}</h2>
                <div className="text-9xl font-black text-white tracking-tighter">
                  {match.team1.score}
                </div>
              </div>

              {/* VS / Time */}
              <div className="text-center">
                {match.status === "live" && (
                  <>
                    <div className="text-5xl font-bold text-yellow-400 mb-2">
                      {match.time}
                    </div>
                    <div className="text-xl text-gray-400">{match.period}</div>
                  </>
                )}
                {match.status === "finished" && (
                  <div className="text-4xl font-bold text-gray-400">FINAL</div>
                )}
                {match.status === "scheduled" && (
                  <div className="text-2xl text-gray-400">VS</div>
                )}
              </div>

              {/* Team 2 */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">{match.team2.name}</h2>
                <div className="text-9xl font-black text-white tracking-tighter">
                  {match.team2.score}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          Scorr Studio • Display ID: {displayId}
        </div>
      </div>
    </div>
  );
}
