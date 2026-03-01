"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  Switch,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Clock,
  MonitorPlay,
  Star,
  GripVertical,
  Settings,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

// Types
interface Court {
  id: string;
  name: string;
  location?: string;
  type: "standard" | "featured" | "streaming";
  active: boolean;
  order: number;
}

interface TimeSlots {
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakDuration: number;
}

// Mock data
const mockVenue = {
  id: "venue_1",
  competitionId: "1",
  courts: [
    { id: "c1", name: "Court 1", location: "Main Hall", type: "streaming" as const, active: true, order: 0 },
    { id: "c2", name: "Court 2", location: "Main Hall", type: "featured" as const, active: true, order: 1 },
    { id: "c3", name: "Court 3", location: "Side Hall", type: "standard" as const, active: true, order: 2 },
    { id: "c4", name: "Table A", location: "Practice Area", type: "standard" as const, active: true, order: 3 },
    { id: "c5", name: "Table B", location: "Practice Area", type: "standard" as const, active: false, order: 4 },
  ],
  timeSlots: {
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: 60,
    breakDuration: 10,
  },
};

const mockCompetition = {
  id: "1",
  name: "Spring Championship 2024",
};

// Court type badge
function CourtTypeBadge({ type }: { type: Court["type"] }) {
  switch (type) {
    case "streaming":
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
          <MonitorPlay className="w-3 h-3" />
          Streaming
        </Badge>
      );
    case "featured":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
          <Star className="w-3 h-3" />
          Featured
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-border text-muted-foreground">
          Standard
        </Badge>
      );
  }
}

export default function CourtsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const [courts, setCourts] = useState<Court[]>(mockVenue.courts);
  const [timeSlots, setTimeSlots] = useState<TimeSlots>(mockVenue.timeSlots);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New court form state
  const [newCourt, setNewCourt] = useState<Partial<Court>>({
    name: "",
    location: "",
    type: "standard",
    active: true,
  });

  // Time slot options
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, "0")}:00`
  );
  const durationOptions = [30, 45, 60, 75, 90, 120];

  const handleAddCourt = () => {
    if (!newCourt.name) return;

    const court: Court = {
      id: `court_${Date.now()}`,
      name: newCourt.name,
      location: newCourt.location,
      type: newCourt.type || "standard",
      active: true,
      order: courts.length,
    };

    setCourts([...courts, court]);
    setNewCourt({ name: "", location: "", type: "standard", active: true });
    setIsAddDialogOpen(false);
  };

  const handleUpdateCourt = (id: string, updates: Partial<Court>) => {
    setCourts(
      courts.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteCourt = (id: string) => {
    setCourts(courts.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message
  };

  const activeCourts = courts.filter((c) => c.active).length;

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

          <div className="flex items-center justify-between">
            <SlideIn direction="up" delay={0.1}>
              <div>
                <h1 className="text-section">Court Management</h1>
                <p className="text-muted-foreground mt-1">
                  {mockCompetition.name}
                </p>
              </div>
            </SlideIn>

            <SlideIn direction="left" delay={0.2}>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{activeCourts}</div>
                  <div className="text-xs text-muted-foreground">Active Courts</div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="glow-accent"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </SlideIn>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courts list */}
          <div className="lg:col-span-2 space-y-6">
            <SlideIn direction="up" delay={0.2}>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Courts & Tables</span>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="glow-accent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Court
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        <TableHead className="text-muted-foreground">Location</TableHead>
                        <TableHead className="text-muted-foreground">Type</TableHead>
                        <TableHead className="text-muted-foreground text-center">Active</TableHead>
                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <StaggerContainer>
                        {courts.map((court, index) => (
                          <StaggerItem key={court.id}>
                            <TableRow className="border-border group">
                              <TableCell className="cursor-grab text-muted-foreground">
                                <GripVertical className="w-4 h-4" />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
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
                                  <span className="font-medium">{court.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {court.location || "-"}
                              </TableCell>
                              <TableCell>
                                <CourtTypeBadge type={court.type} />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={court.active}
                                  onCheckedChange={(checked) =>
                                    handleUpdateCourt(court.id, { active: checked })
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingCourt(court)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCourt(court.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </TableBody>
                  </Table>

                  {courts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No courts configured yet</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(true)}
                        className="mt-4 border-border"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add your first court
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SlideIn>
          </div>

          {/* Time slots configuration */}
          <div className="space-y-6">
            <SlideIn direction="right" delay={0.3}>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select
                        value={timeSlots.startTime}
                        onValueChange={(v) =>
                          setTimeSlots({ ...timeSlots, startTime: v })
                        }
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Select
                        value={timeSlots.endTime}
                        onValueChange={(v) =>
                          setTimeSlots({ ...timeSlots, endTime: v })
                        }
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Match Duration</Label>
                    <Select
                      value={timeSlots.slotDuration.toString()}
                      onValueChange={(v) =>
                        setTimeSlots({ ...timeSlots, slotDuration: parseInt(v) })
                      }
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {d} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Break Between Matches</Label>
                    <Select
                      value={timeSlots.breakDuration.toString()}
                      onValueChange={(v) =>
                        setTimeSlots({ ...timeSlots, breakDuration: parseInt(v) })
                      }
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 5, 10, 15, 20, 30].map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {d} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Total slots per court:</span>{" "}
                      {Math.floor(
                        ((parseInt(timeSlots.endTime.split(":")[0]) -
                          parseInt(timeSlots.startTime.split(":")[0])) *
                          60 +
                          (parseInt(timeSlots.endTime.split(":")[1]) -
                            parseInt(timeSlots.startTime.split(":")[1]))) /
                          (timeSlots.slotDuration + timeSlots.breakDuration)
                      )}{" "}
                      matches
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>

            <SlideIn direction="right" delay={0.4}>
              <Card className="border-border bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium">Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Drag courts to reorder them</li>
                        <li>• Featured courts appear highlighted in the schedule</li>
                        <li>• Streaming courts are for live broadcast matches</li>
                        <li>• Disable courts that aren't available today</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </div>
        </div>
      </div>

      {/* Add Court Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Court</DialogTitle>
            <DialogDescription>
              Add a new court or table to the venue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCourt.name}
                onChange={(e) =>
                  setNewCourt({ ...newCourt, name: e.target.value })
                }
                placeholder="e.g., Court 1, Table A"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input
                value={newCourt.location}
                onChange={(e) =>
                  setNewCourt({ ...newCourt, location: e.target.value })
                }
                placeholder="e.g., Main Hall"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newCourt.type}
                onValueChange={(v) =>
                  setNewCourt({
                    ...newCourt,
                    type: v as Court["type"],
                  })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="streaming">Streaming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCourt}
              disabled={!newCourt.name}
              className="glow-accent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Court
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Court Dialog */}
      <Dialog
        open={!!editingCourt}
        onOpenChange={(open) => !open && setEditingCourt(null)}
      >
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Court</DialogTitle>
            <DialogDescription>
              Update court details
            </DialogDescription>
          </DialogHeader>

          {editingCourt && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingCourt.name}
                  onChange={(e) =>
                    setEditingCourt({ ...editingCourt, name: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editingCourt.location || ""}
                  onChange={(e) =>
                    setEditingCourt({
                      ...editingCourt,
                      location: e.target.value,
                    })
                  }
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={editingCourt.type}
                  onValueChange={(v) =>
                    setEditingCourt({
                      ...editingCourt,
                      type: v as Court["type"],
                    })
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="streaming">Streaming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCourt(null)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingCourt) {
                  handleUpdateCourt(editingCourt.id, editingCourt);
                  setEditingCourt(null);
                }
              }}
              className="glow-accent"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
