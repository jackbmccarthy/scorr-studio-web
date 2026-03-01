"use client";

import { useParams } from "next/navigation";
import { PrintableSchedule, QRCode } from "@/components/print";
import { Card, CardContent, Badge } from "@/components/ui";
import { Calendar, MapPin, Trophy, Share2, Clock } from "lucide-react";

// Mock data - will be fetched from Convex based on token
const mockMatches = [
  {
    id: "1",
    sportName: "Table Tennis",
    team1: { name: "John Smith", score: 3 },
    team2: { name: "Jane Doe", score: 2 },
    status: "finished",
    createdAt: "2024-02-13T10:00:00Z",
    eventName: "Spring Championship",
    matchRound: "Quarter Final 1",
  },
  {
    id: "2",
    sportName: "Basketball",
    team1: { name: "Lakers", score: 98 },
    team2: { name: "Celtics", score: 102 },
    status: "live",
    createdAt: "2024-02-13T14:00:00Z",
    eventName: "Spring Championship",
    matchRound: "Semi Final 1",
  },
  {
    id: "3",
    sportName: "Soccer",
    team1: { name: "United FC", score: 0 },
    team2: { name: "City FC", score: 0 },
    status: "scheduled",
    createdAt: "2024-02-14T15:00:00Z",
    eventName: "Spring Championship",
    matchRound: "Final",
  },
  {
    id: "4",
    sportName: "Tennis",
    team1: { name: "Nadal", score: 2 },
    team2: { name: "Federer", score: 1 },
    status: "live",
    createdAt: "2024-02-13T16:30:00Z",
    eventName: "Spring Championship",
    matchRound: "Quarter Final 2",
  },
  {
    id: "5",
    sportName: "Badminton",
    team1: { name: "Team Alpha" },
    team2: { name: "Team Beta" },
    status: "scheduled",
    createdAt: "2024-02-14T09:00:00Z",
    eventName: "Spring Championship",
    matchRound: "Quarter Final 3",
  },
];

const mockTournament = {
  name: "Spring Championship 2024",
  venue: "Sports Complex, Main Arena",
  startDate: "2024-02-13",
  endDate: "2024-02-15",
  status: "live",
};

export default function ShareSchedulePage() {
  const params = useParams();
  const token = params.token as string;
  
  // In production, fetch tournament data from Convex using token
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${token}/schedule`
    : '';

  const liveCount = mockMatches.filter(m => m.status === "live").length;
  const scheduledCount = mockMatches.filter(m => m.status === "scheduled").length;
  const finishedCount = mockMatches.filter(m => m.status === "finished").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8 text-primary" />
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

      {/* Stats Bar */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{liveCount}</div>
              <div className="text-xs text-muted-foreground">Live</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{scheduledCount}</div>
              <div className="text-xs text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{finishedCount}</div>
              <div className="text-xs text-muted-foreground">Finished</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{mockMatches.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule View */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <PrintableSchedule
              matches={mockMatches}
              tournamentName={mockTournament.name}
              qrUrl={shareUrl}
              groupByDate={true}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Print Schedule
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

        {/* Auto-refresh notice */}
        <div className="mt-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          This page auto-updates every 30 seconds
        </div>
      </div>
    </div>
  );
}
