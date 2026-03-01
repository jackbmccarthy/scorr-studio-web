"use client";

import { useParams } from "next/navigation";
import { PrintableBracket } from "@/components/print";
import { QRCode } from "@/components/print";
import { Card, CardContent, Badge } from "@/components/ui";
import { Calendar, MapPin, Trophy, Share2 } from "lucide-react";

// Mock data - will be fetched from Convex based on token
const mockBracketMatches = [
  {
    id: "1",
    team1: { name: "Player 1", score: 3 },
    team2: { name: "Player 2", score: 2 },
    winner: "team1",
    round: "Quarter Finals",
    roundIndex: 0,
    matchIndex: 0,
    status: "finished",
  },
  {
    id: "2",
    team1: { name: "Player 3", score: 1 },
    team2: { name: "Player 4", score: 3 },
    winner: "team2",
    round: "Quarter Finals",
    roundIndex: 0,
    matchIndex: 1,
    status: "finished",
  },
  {
    id: "3",
    team1: { name: "Player 5" },
    team2: { name: "Player 6" },
    round: "Quarter Finals",
    roundIndex: 0,
    matchIndex: 2,
    status: "scheduled",
  },
  {
    id: "4",
    team1: { name: "Player 7", score: 0 },
    team2: { name: "Player 8", score: 0 },
    round: "Quarter Finals",
    roundIndex: 0,
    matchIndex: 3,
    status: "live",
  },
  {
    id: "5",
    team1: { name: "Player 1", score: 2 },
    team2: { name: "Player 4", score: 1 },
    winner: "team1",
    round: "Semi Finals",
    roundIndex: 1,
    matchIndex: 0,
    status: "finished",
  },
  {
    id: "6",
    team1: { name: "Player 5" },
    team2: { name: "Player 7" },
    round: "Semi Finals",
    roundIndex: 1,
    matchIndex: 1,
    status: "scheduled",
  },
];

const mockTournament = {
  name: "Spring Championship 2024",
  venue: "Sports Complex, Main Arena",
  startDate: "2024-02-13",
  endDate: "2024-02-15",
  status: "live",
};

export default function ShareBracketPage() {
  const params = useParams();
  const token = params.token as string;
  
  // In production, fetch tournament data from Convex using token
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${token}`
    : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">{mockTournament.name}</h1>
                {mockTournament.status === "live" && (
                  <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(mockTournament.startDate).toLocaleDateString()} - {new Date(mockTournament.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mockTournament.venue}
                </div>
              </div>
            </div>
            <div className="text-right">
              <QRCode url={shareUrl} size={100} showLabel={false} />
              <p className="text-xs text-muted-foreground mt-2">Scan to share</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket View */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <PrintableBracket
              matches={mockBracketMatches}
              tournamentName={mockTournament.name}
              qrUrl={shareUrl}
              bracketType="single"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Print Bracket
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              alert("Link copied to clipboard!");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
