"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Input, Label, Badge, Card, CardContent } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Calendar,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMinutes, parse, setHours, setMinutes } from "date-fns";

// Types
export interface Court {
  id: string;
  name: string;
  location?: string;
  type?: "standard" | "featured" | "streaming";
}

export interface Match {
  matchId: string;
  team1: { name: string };
  team2: { name: string };
  round?: string;
  eventName?: string;
}

export interface ScheduleConflict {
  type: "court_overlap" | "player_double_booked" | "rest_period_violation";
  severity: "error" | "warning";
  message: string;
}

interface MatchScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match | null;
  courts: Court[];
  competitionId: string;
  existingSchedule?: {
    courtId: string;
    startTime: string;
    endTime: string;
  };
  conflicts?: ScheduleConflict[];
  onSchedule: (data: {
    matchId: string;
    courtId: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  onUnschedule?: (matchId: string) => Promise<void>;
  onCheckConflicts?: (data: {
    courtId: string;
    startTime: string;
    endTime: string;
  }) => Promise<ScheduleConflict[]>;
  defaultDuration?: number; // minutes
  operatingHours?: {
    startTime: string;
    endTime: string;
  };
  dates?: string[]; // Available dates
}

export function MatchScheduleDialog({
  open,
  onOpenChange,
  match,
  courts,
  competitionId,
  existingSchedule,
  conflicts: externalConflicts,
  onSchedule,
  onUnschedule,
  onCheckConflicts,
  defaultDuration = 60,
  operatingHours = { startTime: "09:00", endTime: "18:00" },
  dates = [format(new Date(), "yyyy-MM-dd")],
}: MatchScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState(
    existingSchedule?.startTime
      ? format(new Date(existingSchedule.startTime), "yyyy-MM-dd")
      : dates[0]
  );
  const [selectedCourt, setSelectedCourt] = useState(
    existingSchedule?.courtId || ""
  );
  const [selectedTime, setSelectedTime] = useState(
    existingSchedule?.startTime
      ? format(new Date(existingSchedule.startTime), "HH:mm")
      : operatingHours.startTime
  );
  const [duration, setDuration] = useState(defaultDuration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>(
    externalConflicts || []
  );
  const [isValidating, setIsValidating] = useState(false);

  // Calculate end time
  const endTime = useMemo(() => {
    if (!selectedTime) return "";
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const startDate = setHours(setMinutes(new Date(), minutes), hours);
    const endDate = addMinutes(startDate, duration);
    return format(endDate, "HH:mm");
  }, [selectedTime, duration]);

  // Generate time options
  const timeOptions = useMemo(() => {
    const options: string[] = [];
    const [startHour, startMin] = operatingHours.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = operatingHours.endTime.split(":").map(Number);

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === endHour && m > endMin) break;
        if (h === startHour && m < startMin) continue;
        options.push(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
        );
      }
    }

    return options;
  }, [operatingHours]);

  // Duration options
  const durationOptions = [30, 45, 60, 75, 90, 120];

  // Check for conflicts when selection changes
  useEffect(() => {
    if (!onCheckConflicts || !selectedCourt || !selectedDate || !selectedTime) {
      return;
    }

    const checkConflicts = async () => {
      setIsValidating(true);
      try {
        const startIso = `${selectedDate}T${selectedTime}:00`;
        const endIso = `${selectedDate}T${endTime}:00`;
        const newConflicts = await onCheckConflicts({
          courtId: selectedCourt,
          startTime: startIso,
          endTime: endIso,
        });
        setConflicts(newConflicts);
      } catch (error) {
        console.error("Error checking conflicts:", error);
      } finally {
        setIsValidating(false);
      }
    };

    const debounce = setTimeout(checkConflicts, 300);
    return () => clearTimeout(debounce);
  }, [
    selectedCourt,
    selectedDate,
    selectedTime,
    endTime,
    onCheckConflicts,
  ]);

  // Reset form when match changes
  useEffect(() => {
    if (match && existingSchedule) {
      setSelectedDate(format(new Date(existingSchedule.startTime), "yyyy-MM-dd"));
      setSelectedCourt(existingSchedule.courtId);
      setSelectedTime(format(new Date(existingSchedule.startTime), "HH:mm"));
    } else {
      setSelectedDate(dates[0]);
      setSelectedCourt("");
      setSelectedTime(operatingHours.startTime);
    }
    setConflicts(externalConflicts || []);
  }, [match, existingSchedule, dates, operatingHours.startTime, externalConflicts]);

  const handleSubmit = async () => {
    if (!match || !selectedCourt || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const startTime = `${selectedDate}T${selectedTime}:00`;
      const endTimeIso = `${selectedDate}T${endTime}:00`;

      await onSchedule({
        matchId: match.matchId,
        courtId: selectedCourt,
        startTime,
        endTime: endTimeIso,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error scheduling match:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnschedule = async () => {
    if (!match || !onUnschedule) return;

    setIsSubmitting(true);
    try {
      await onUnschedule(match.matchId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error unscheduling match:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = conflicts.some((c) => c.severity === "error");
  const canSubmit = selectedCourt && selectedDate && selectedTime && !hasErrors;

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Match
          </DialogTitle>
          <DialogDescription>
            Assign this match to a court and time slot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Match info */}
          <Card className="bg-background/50 border-border">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="text-lg font-semibold">{match.team1.name}</div>
                <div className="text-sm text-muted-foreground">vs</div>
                <div className="text-lg font-semibold">{match.team2.name}</div>
                {(match.round || match.eventName) && (
                  <div className="pt-2 text-xs text-muted-foreground">
                    {match.eventName && <span>{match.eventName}</span>}
                    {match.eventName && match.round && <span> • </span>}
                    {match.round && <span>{match.round}</span>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date selector */}
          {dates.length > 1 && (
            <div className="space-y-2">
              <Label>Date</Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {dates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Court selector */}
          <div className="space-y-2">
            <Label>Court</Label>
            <Select value={selectedCourt} onValueChange={setSelectedCourt}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{court.name}</span>
                      {court.location && (
                        <span className="text-xs text-muted-foreground">
                          ({court.location})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time and duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={duration.toString()}
                onValueChange={(v) => setDuration(parseInt(v))}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End time display */}
          {endTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {selectedTime} - {endTime}
              </span>
            </div>
          )}

          {/* Conflicts */}
          <AnimatePresence>
            {conflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-lg text-sm",
                      conflict.severity === "error"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    )}
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{conflict.message}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validating indicator */}
          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking for conflicts...
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {existingSchedule && onUnschedule && (
            <Button
              variant="outline"
              onClick={handleUnschedule}
              disabled={isSubmitting}
              className="mr-auto border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting || isValidating}
            className="glow-accent"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Schedule Match
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MatchScheduleDialog;
