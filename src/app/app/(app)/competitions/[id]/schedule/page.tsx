"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Play,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Sparkles,
  Zap,
} from "lucide-react";
import { format, addDays, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem, AnimatedNumber } from "@/components/motion";
import { cn } from "@/lib/utils";

// Mock data
const mockVenue = {
  courts: [
    { id: "c1", name: "Court 1", location: "Main Hall", type: "streaming" as const, active: true },
    { id: "c2", name: "Court 2", location: "Main Hall", type: "featured" as const, active: true },
    { id: "c3", name: "Court 3", location: "Side Hall", type: "standard" as const, active: true },
    { id: "c4", name: "Table A", location: "Practice Area", type: "standard" as const, active: true },
  ],
  timeSlots: {
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: 60,
    breakDuration: 10,
  },
};

const mockMatches = [
  {
    id: "m1",
    matchId: "m1",
    team1: { name: "John Smith", score: 3 },
    team2: { name: "Mike Johnson", score: 1 },
    courtId: "c1",
    startTime: "2024-03-01T09:00:00",
    endTime: "2024-03-01T10:00:00",
    status: "completed" as const,
    round: "Round of 16",
    conflicts: [],
  },
  {
    id: "m2",
    matchId: "m2",
    team1: { name: "David Lee" },
    team2: { name: "Tom Wilson" },
    courtId: "c1",
    startTime: "2024-03-01T10:10:00",
    endTime: "2024-03-01T11:10:00",
    status: "in_progress" as const,
    round: "Round of 16",
    conflicts: [],
  },
  {
    id: "m3",
    matchId: "m3",
    team1: { name: "Sarah Chen" },
    team2: { name: "Lisa Park" },
    courtId: "c2",
    startTime: "2024-03-01T09:00:00",
    endTime: "2024-03-01T10:00:00",
    status: "scheduled" as const,
    round: "Round of 16",
    conflicts: [{ type: "rest_period_violation", severity: "warning", message: "Player has only 15 min rest" }],
  },
  {
    id: "m4",
    matchId: "m4",
    team1: { name: "Emily Davis" },
    team2: { name: "Rachel Kim" },
    courtId: "c3",
    startTime: "2024-03-01T11:00:00",
    endTime: "2024-03-01T12:00:00",
    status: "scheduled" as const,
    round: "Quarter Finals",
    conflicts: [],
  },
  {
    id: "m5",
    matchId: "m5",
    team1: { name: "Alex Wong" },
    team2: { name: "Chris Taylor" },
    courtId: "c4",
    startTime: "2024-03-01T14:00:00",
    endTime: "2024-03-01T15:00:00",
    status: "delayed" as const,
    round: "Quarter Finals",
    conflicts: [],
  },
];

const mockUnscheduledMatches = [
  { id: "u1", matchId: "u1", team1: { name: "Ryan Miller" }, team2: { name: "James Brown" }, round: "Semi Finals" },
  { id: "u2", matchId: "u2", team1: { name: "Kevin Zhang" }, team2: { name: "Brian Lee" }, round: "Semi Finals" },
  { id: "u3", matchId: "u3", team1: { name: "TBD" }, team2: { name: "TBD" }, round: "Final" },
];

const mockCompetition = {
  id: "1",
  name: "Spring Championship 2024",
  startDate: "2024-03-01",
  endDate: "2024-03-03",
};

// Generate time slots
function generateTimeSlots(startTime: string, endTime: string, slotDuration: number, breakDuration: number) {
  const slots: Array<{ time: string; iso: string }> = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const totalSlot = slotDuration + breakDuration;

  for (
    let minutes = startHour * 60 + startMin;
    minutes + slotDuration <= endHour * 60 + endMin;
    minutes += totalSlot
  ) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
    slots.push({ time: timeStr, iso: `2024-03-01T${timeStr}:00` });
  }

  return slots;
}

// Status badge
function MatchStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "in_progress":
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
          <Play className="w-3 h-3" />
          Live
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Done
        </Badge>
      );
    case "delayed":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
          <AlertTriangle className="w-3 h-3" />
          Delayed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-border text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );
  }
}

export default function ScheduleViewPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const [selectedDate, setSelectedDate] = useState(new Date("2024-03-01"));
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeSlots = useMemo(
    () =>
      generateTimeSlots(
        mockVenue.timeSlots.startTime,
        mockVenue.timeSlots.endTime,
        mockVenue.timeSlots.slotDuration,
        mockVenue.timeSlots.breakDuration
      ),
    [mockVenue.timeSlots]
  );

  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAutoAssigning(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  // Stats
  const scheduledCount = mockMatches.length;
  const unscheduledCount = mockUnscheduledMatches.length;
  const liveCount = mockMatches.filter((m) => m.status === "in_progress").length;
  const conflictCount = mockMatches.reduce(
    (acc, m) => acc + (m.conflicts?.length || 0),
    0
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <FadeIn>
            <Link
              href={`/app/competitions/${competitionId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Competition
            </Link>
          </FadeIn>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <SlideIn direction="up" delay={0.1}>
              <div>
                <h1 className="text-section">Match Schedule</h1>
                <p className="text-muted-foreground mt-1">
                  {mockCompetition.name}
                </p>
              </div>
            </SlideIn>

            <SlideIn direction="left" delay={0.2}>
              <div className="flex items-center gap-3">
                <StaggerContainer className="hidden md:grid grid-cols-4 gap-3">
                  <StaggerItem>
                    <div className="px-4 py-2 rounded-lg bg-card border border-border text-center">
                      <div className="text-xl font-bold text-primary">{scheduledCount}</div>
                      <div className="text-xs text-muted-foreground">Scheduled</div>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="px-4 py-2 rounded-lg bg-card border border-border text-center">
                      <div className="text-xl font-bold text-yellow-400">{unscheduledCount}</div>
                      <div className="text-xs text-muted-foreground">Unscheduled</div>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="px-4 py-2 rounded-lg bg-card border border-border text-center">
                      <div className="text-xl font-bold text-red-400">{liveCount}</div>
                      <div className="text-xs text-muted-foreground">Live</div>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="px-4 py-2 rounded-lg bg-card border border-border text-center">
                      <div className="text-xl font-bold text-orange-400">{conflictCount}</div>
                      <div className="text-xs text-muted-foreground">Conflicts</div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-border"
                >
                  <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </SlideIn>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Date navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevDay}
                className="border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDay}
                className="border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-r-none",
                    viewMode === "grid" && "bg-primary text-primary-foreground"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-l-none",
                    viewMode === "list" && "bg-primary text-primary-foreground"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleAutoAssign}
                disabled={isAutoAssigning}
                className="glow-accent"
              >
                {isAutoAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-Assign All
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {viewMode === "grid" ? (
          <SlideIn direction="up" delay={0.3}>
            <Card className="border-border overflow-hidden">
              <CardContent className="p-0">
                {/* Schedule grid */}
                <div className="overflow-x-auto">
                  {/* Header row */}
                  <div
                    className="grid gap-1 bg-card/50 border-b border-border sticky top-0 z-20"
                    style={{ gridTemplateColumns: `140px repeat(${timeSlots.length}, minmax(80px, 1fr))` }}
                  >
                    <div className="p-3 font-semibold text-sm text-muted-foreground">
                      Courts
                    </div>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className="p-2 text-center text-xs font-medium text-muted-foreground border-l border-border"
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>

                  {/* Court rows */}
                  {mockVenue.courts.filter((c) => c.active).map((court, rowIndex) => {
                    const courtMatches = mockMatches.filter((m) => m.courtId === court.id);

                    return (
                      <motion.div
                        key={court.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: rowIndex * 0.05 }}
                        className="grid gap-1 border-b border-border/50"
                        style={{ gridTemplateColumns: `140px repeat(${timeSlots.length}, minmax(80px, 1fr))` }}
                      >
                        {/* Court label */}
                        <div className="p-3 flex items-center gap-2 bg-card/30 border-r border-border sticky left-0 z-10">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              court.type === "streaming"
                                ? "bg-red-500"
                                : court.type === "featured"
                                ? "bg-yellow-500"
                                : "bg-primary"
                            )}
                          />
                          <div>
                            <div className="font-medium text-sm">{court.name}</div>
                            {court.location && (
                              <div className="text-xs text-muted-foreground">
                                {court.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Time slots */}
                        {timeSlots.map((slot) => {
                          const match = courtMatches.find((m) => {
                            const matchTime = new Date(m.startTime);
                            const slotDate = new Date(slot.iso);
                            return Math.abs(matchTime.getTime() - slotDate.getTime()) < 5 * 60 * 1000;
                          });

                          return (
                            <div
                              key={slot.time}
                              className="p-1 border-l border-border/50 min-h-[100px] hover:bg-card/20 transition-colors"
                            >
                              {match && (
                                <div
                                  className={cn(
                                    "h-full p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]",
                                    match.status === "in_progress" && "bg-red-500/10 border-red-500/50",
                                    match.status === "completed" && "bg-green-500/10 border-green-500/50",
                                    match.status === "delayed" && "bg-yellow-500/10 border-yellow-500/50",
                                    match.status === "scheduled" && "bg-card border-border hover:border-primary/50",
                                    match.conflicts?.length && "border-orange-500/50"
                                  )}
                                >
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {match.status === "in_progress" && (
                                      <span className="text-red-400 font-medium">● Live</span>
                                    )}
                                    {match.status === "completed" && (
                                      <span className="text-green-400">✓ Final</span>
                                    )}
                                    {match.status === "delayed" && (
                                      <span className="text-yellow-400">⚠ Delayed</span>
                                    )}
                                    {match.status === "scheduled" && (
                                      <span className="text-muted-foreground">
                                        {format(new Date(match.startTime), "HH:mm")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs font-medium truncate">{match.team1.name}</div>
                                  <div className="text-xs text-muted-foreground">vs</div>
                                  <div className="text-xs font-medium truncate">{match.team2.name}</div>
                                  {match.conflicts?.length > 0 && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-orange-400">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span className="truncate">{match.conflicts.length}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ) : (
          <SlideIn direction="up" delay={0.3}>
            {/* List view */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  All Scheduled Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockMatches
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((match, idx) => {
                      const court = mockVenue.courts.find((c) => c.id === match.courtId);

                      return (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors hover:border-primary/50",
                            match.status === "in_progress" && "bg-red-500/5 border-red-500/30",
                            match.status === "completed" && "bg-green-500/5 border-green-500/30",
                            match.status === "delayed" && "bg-yellow-500/5 border-yellow-500/30",
                            match.status === "scheduled" && "bg-card/50 border-border"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-20 text-sm font-medium">
                              {format(new Date(match.startTime), "HH:mm")}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{match.team1.name}</span>
                                {match.team1.score !== undefined && (
                                  <span className="text-primary font-bold">{match.team1.score}</span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                vs {match.team2.name}
                                {match.team2.score !== undefined && (
                                  <span className="text-primary font-bold ml-2">{match.team2.score}</span>
                                )}
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              {match.round}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {court && (
                              <Badge variant="outline" className="border-border">
                                {court.name}
                              </Badge>
                            )}
                            <MatchStatusBadge status={match.status} />
                            {match.conflicts?.length > 0 && (
                              <div className="flex items-center gap-1 text-orange-400">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Unscheduled matches sidebar (shown at bottom for now) */}
        {mockUnscheduledMatches.length > 0 && (
          <SlideIn direction="up" delay={0.4}>
            <Card className="border-border mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Unscheduled Matches
                  </div>
                  <Badge variant="secondary">{mockUnscheduledMatches.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mockUnscheduledMatches.map((match, idx) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors bg-card/50"
                    >
                      <div className="text-sm font-medium">{match.team1.name}</div>
                      <div className="text-xs text-muted-foreground my-1">vs</div>
                      <div className="text-sm font-medium">{match.team2.name}</div>
                      {match.round && (
                        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                          {match.round}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button
          onClick={handleAutoAssign}
          disabled={isAutoAssigning}
          size="lg"
          className="glow-accent shadow-lg"
        >
          {isAutoAssigning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Auto-Assign All
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
