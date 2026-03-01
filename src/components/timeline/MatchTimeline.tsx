"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Circle,
  Trophy,
  Clock,
  Users,
  AlertCircle,
  Video,
  Plus,
  ChevronDown,
  ChevronUp,
  Play,
  X
} from "lucide-react";

// Timeline Event
interface TimelineEvent {
  id: string;
  type: "point" | "game" | "set" | "timeout" | "substitution" | "card" | "video_ref" | "custom";
  timestamp: string;
  team?: "team1" | "team2";
  player?: string;
  description?: string;
  videoUrl?: string;
  data?: Record<string, unknown>;
}

// Timeline Props
interface MatchTimelineProps {
  events: TimelineEvent[];
  team1Name?: string;
  team2Name?: string;
  onAddEvent?: (event: Omit<TimelineEvent, "id" | "timestamp">) => void;
  onDeleteEvent?: (eventId: string) => void;
  className?: string;
  compact?: boolean;
}

export function MatchTimeline({
  events,
  team1Name = "Team 1",
  team2Name = "Team 2",
  onAddEvent,
  onDeleteEvent,
  className,
  compact = false,
}: MatchTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const displayEvents = showAll ? events : events.slice(-10);
  const hasMore = events.length > 10;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <CardTitle className="text-base font-display">Match Timeline</CardTitle>
          </div>
          {onAddEvent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingEvent(true)}
              className="h-8 px-2"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No events recorded yet
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            {/* Events */}
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {displayEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "relative pl-10 group",
                      compact && "pl-8"
                    )}
                  >
                    {/* Event Dot */}
                    <div className="absolute left-2.5 top-1">
                      <EventDot type={event.type} team={event.team} />
                    </div>

                    {/* Event Content */}
                    <div
                      className={cn(
                        "p-2 rounded-lg border transition-all",
                        selectedEvent === event.id
                          ? "bg-primary/10 border-primary/30"
                          : "bg-muted/50 border-border/50 hover:border-border"
                      )}
                      onClick={() => setSelectedEvent(
                        selectedEvent === event.id ? null : event.id
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <EventIcon type={event.type} />
                            <span className="text-sm font-medium">
                              {event.description || getEventLabel(event.type)}
                            </span>
                            {event.team && (
                              <Badge variant="outline" className="text-[10px]">
                                {event.team === "team1" ? team1Name : team2Name}
                              </Badge>
                            )}
                          </div>
                          {event.player && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              {event.player}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground block mt-1">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Video Link */}
                        {event.videoUrl && (
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Play className="w-3 h-3" />
                          </Button>
                        )}

                        {/* Delete Button */}
                        {onDeleteEvent && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(event.id);
                            }}
                            className="h-6 px-2 opacity-0 group-hover:opacity-100 text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Show More/Less */}
            {hasMore && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-2 gap-1"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show {events.length - 10} More
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Add Event Form */}
        <AnimatePresence>
          {isAddingEvent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-3 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {(["point", "game", "set", "timeout"] as const).map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onAddEvent?.({ type, team: "team1" });
                        setIsAddingEvent(false);
                      }}
                      className="justify-start gap-2"
                    >
                      <EventIcon type={type} />
                      {getEventLabel(type)}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Event Dot Component
function EventDot({ type, team }: { type: string; team?: string }) {
  const getDotColor = () => {
    if (team === "team1") return "bg-primary";
    if (team === "team2") return "bg-red-500";
    
    switch (type) {
      case "set":
      case "game":
        return "bg-yellow-500";
      case "timeout":
        return "bg-orange-500";
      case "card":
        return "bg-red-600";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className={cn(
      "w-3 h-3 rounded-full ring-2 ring-background",
      getDotColor()
    )} />
  );
}

// Event Icon Component
function EventIcon({ type }: { type: string }) {
  const iconClass = "w-4 h-4";
  
  switch (type) {
    case "point":
      return <Circle className={cn(iconClass, "text-blue-400")} />;
    case "game":
      return <Trophy className={cn(iconClass, "text-yellow-500")} />;
    case "set":
      return <Trophy className={cn(iconClass, "text-yellow-500")} />;
    case "timeout":
      return <Clock className={cn(iconClass, "text-orange-500")} />;
    case "substitution":
      return <Users className={cn(iconClass, "text-purple-400")} />;
    case "card":
      return <AlertCircle className={cn(iconClass, "text-red-500")} />;
    case "video_ref":
      return <Video className={cn(iconClass, "text-cyan-400")} />;
    default:
      return <Circle className={cn(iconClass, "text-muted-foreground")} />;
  }
}

// Get Event Label
function getEventLabel(type: string): string {
  switch (type) {
    case "point":
      return "Point Scored";
    case "game":
      return "Game Won";
    case "set":
      return "Set Won";
    case "timeout":
      return "Timeout";
    case "substitution":
      return "Substitution";
    case "card":
      return "Card";
    case "video_ref":
      return "Video Review";
    default:
      return "Event";
  }
}

export default MatchTimeline;
