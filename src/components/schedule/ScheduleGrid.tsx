"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCenter,
  Over,
} from "@dnd-kit/core";
import {
  Badge,
  Card,
  CardContent,
  Button,
} from "@/components/ui";
import {
  Clock,
  GripVertical,
  AlertTriangle,
  Play,
  CheckCircle2,
  Loader2,
  X,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface Court {
  id: string;
  name: string;
  location?: string;
  type?: "standard" | "featured" | "streaming";
  active?: boolean;
}

export interface ScheduledMatch {
  id: string;
  matchId: string;
  team1: { name: string; score?: number };
  team2: { name: string; score?: number };
  courtId: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  round?: string;
  eventName?: string;
  conflicts?: ScheduleConflict[];
}

export interface ScheduleConflict {
  type: "court_overlap" | "player_double_booked" | "rest_period_violation";
  severity: "error" | "warning";
  message: string;
}

export interface TimeSlot {
  time: string;
  iso: string;
}

interface ScheduleGridProps {
  courts: Court[];
  matches: ScheduledMatch[];
  timeSlots: TimeSlot[];
  date: string;
  onMatchClick?: (match: ScheduledMatch) => void;
  onMatchDrop?: (matchId: string, courtId: string, startTime: string) => void;
  unscheduledMatches?: Array<{
    id: string;
    matchId: string;
    team1: { name: string };
    team2: { name: string };
    round?: string;
  }>;
  className?: string;
}

// Status badge component
function MatchStatusBadge({ status }: { status: ScheduledMatch["status"] }) {
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

// Draggable match card for unscheduled matches
interface DraggableMatchCardProps {
  match: ScheduledMatch;
  onClick?: () => void;
  isDragging?: boolean;
}

function MatchCard({ match, onClick, isDragging }: DraggableMatchCardProps) {
  const hasConflicts = match.conflicts && match.conflicts.length > 0;
  const hasError = match.conflicts?.some((c) => c.severity === "error");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "group relative p-3 rounded-lg border cursor-pointer transition-all",
        "bg-card/50 hover:bg-card/80",
        isDragging && "ring-2 ring-primary shadow-lg opacity-90",
        hasError
          ? "border-red-500/50 hover:border-red-500"
          : hasConflicts
          ? "border-yellow-500/50 hover:border-yellow-500"
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Match info */}
      <div className="pl-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {match.startTime} - {match.endTime}
          </div>
          <MatchStatusBadge status={match.status} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate">{match.team1.name}</span>
            {match.team1.score !== undefined && (
              <span className="font-bold text-primary">{match.team1.score}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">vs</div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate">{match.team2.name}</span>
            {match.team2.score !== undefined && (
              <span className="font-bold text-primary">{match.team2.score}</span>
            )}
          </div>
        </div>

        {match.round && (
          <div className="text-xs text-muted-foreground">{match.round}</div>
        )}

        {/* Conflicts */}
        {hasConflicts && (
          <div className="pt-2 border-t border-border space-y-1">
            {match.conflicts!.map((conflict, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-1 text-xs",
                  conflict.severity === "error"
                    ? "text-red-400"
                    : "text-yellow-400"
                )}
              >
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{conflict.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Empty slot component
interface EmptySlotProps {
  court: Court;
  timeSlot: TimeSlot;
  isOver?: boolean;
}

function EmptySlot({ court, timeSlot, isOver }: EmptySlotProps) {
  return (
    <div
      className={cn(
        "h-full min-h-[100px] rounded-lg border-2 border-dashed transition-all flex items-center justify-center",
        isOver
          ? "border-primary bg-primary/10"
          : "border-border/50 hover:border-border hover:bg-card/30"
      )}
    >
      <div className="text-xs text-muted-foreground text-center">
        <div>{court.name}</div>
        <div>{timeSlot.time}</div>
      </div>
    </div>
  );
}

// Main schedule grid component
export function ScheduleGrid({
  courts,
  matches,
  timeSlots,
  date,
  onMatchClick,
  onMatchDrop,
  unscheduledMatches = [],
  className,
}: ScheduleGridProps) {
  const [activeMatch, setActiveMatch] = useState<ScheduledMatch | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{
    courtId: string;
    time: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group matches by court and time slot
  const matchGrid = useMemo(() => {
    const grid: Record<string, Record<string, ScheduledMatch>> = {};

    for (const match of matches) {
      if (!grid[match.courtId]) {
        grid[match.courtId] = {};
      }
      // Extract time from startTime
      const time = new Date(match.startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      grid[match.courtId][time] = match;
    }

    return grid;
  }, [matches]);

  const handleDragStart = (event: DragStartEvent) => {
    const matchId = event.active.id as string;
    const match = matches.find((m) => m.matchId === matchId) ||
      unscheduledMatches.find((m) => m.matchId === matchId) as ScheduledMatch;
    if (match) {
      setActiveMatch(match);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveMatch(null);
    setDragOverSlot(null);

    if (over && onMatchDrop) {
      const matchId = active.id as string;
      const [courtId, time] = (over.id as string).split("-");
      onMatchDrop(matchId, courtId, `${date}T${time}:00`);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      const [courtId, time] = String(event.over.id).split("-");
      setDragOverSlot({ courtId, time });
    } else {
      setDragOverSlot(null);
    }
  };

  const activeCourts = courts.filter((c) => c.active !== false);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={cn("overflow-x-auto", className)}>
        {/* Header row with times */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="grid gap-1" style={{ gridTemplateColumns: `140px repeat(${timeSlots.length}, minmax(80px, 1fr))` }}>
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
        </div>

        {/* Court rows */}
        <div className="relative">
          {activeCourts.map((court, rowIndex) => (
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
                const match = matchGrid[court.id]?.[slot.time];
                const slotId = `${court.id}-${slot.time}`;
                const isOver =
                  dragOverSlot?.courtId === court.id &&
                  dragOverSlot?.time === slot.time;

                return (
                  <div
                    key={slotId}
                    id={slotId}
                    className={cn(
                      "p-1 border-l border-border/50 min-h-[100px]",
                      isOver && "bg-primary/5"
                    )}
                  >
                    {match ? (
                      <MatchCard
                        match={match}
                        onClick={() => onMatchClick?.(match)}
                      />
                    ) : (
                      <EmptySlot
                        court={court}
                        timeSlot={slot}
                        isOver={isOver}
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeMatch && (
          <div className="rotate-3 opacity-90">
            <MatchCard match={activeMatch} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Schedule grid wrapper with sidebar for unscheduled matches
interface ScheduleGridWithSidebarProps extends ScheduleGridProps {
  unscheduledMatches: Array<{
    id: string;
    matchId: string;
    team1: { name: string };
    team2: { name: string };
    round?: string;
  }>;
  onAutoAssign?: () => void;
  isAutoAssigning?: boolean;
}

export function ScheduleGridWithSidebar({
  unscheduledMatches,
  onAutoAssign,
  isAutoAssigning,
  ...gridProps
}: ScheduleGridWithSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex gap-4">
      {/* Sidebar with unscheduled matches */}
      <AnimatePresence>
        {sidebarOpen && unscheduledMatches.length > 0 && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <Card className="border-border h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Unscheduled</h3>
                  <Badge variant="secondary">{unscheduledMatches.length}</Badge>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {unscheduledMatches.map((match) => (
                    <div
                      key={match.matchId}
                      id={match.matchId}
                      className="p-3 rounded-lg border border-border hover:border-primary/50 cursor-grab active:cursor-grabbing transition-colors bg-card/50"
                    >
                      <div className="text-sm font-medium">
                        {match.team1.name}
                      </div>
                      <div className="text-xs text-muted-foreground">vs</div>
                      <div className="text-sm font-medium">
                        {match.team2.name}
                      </div>
                      {match.round && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {match.round}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {onAutoAssign && (
                  <Button
                    onClick={onAutoAssign}
                    disabled={isAutoAssigning}
                    className="w-full glow-accent"
                  >
                    {isAutoAssigning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Auto-Assign All
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle sidebar button */}
      {unscheduledMatches.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 left-4 z-30"
        >
          {sidebarOpen ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Hide Sidebar
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              {unscheduledMatches.length} Unscheduled
            </>
          )}
        </Button>
      )}

      {/* Main grid */}
      <div className="flex-1 min-w-0">
        <ScheduleGrid {...gridProps} />
      </div>
    </div>
  );
}

export default ScheduleGrid;
