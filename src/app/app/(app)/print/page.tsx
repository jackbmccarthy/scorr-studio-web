"use client";

import { useState, useMemo } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Label } from "@/components/ui";
import {
  PrintableSchedule,
  PrintableBracket,
  PrintableCourtAssignments
} from "@/components/print";
import {
  Printer,
  FileText,
  Calendar,
  MapPin,
  Trophy,
  Download,
  Check
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTenant } from "@/components/tenant-provider";

export default function PrintPage() {
  const { tenantId } = useTenant();
  const matches = useQuery(api.matches.getByTenant as any, { tenantId }) as any[] | undefined;
  const isLoading = matches === undefined;

  const allMatches = matches ?? [];

  // Transform matches into the format expected by print components
  const printMatches = useMemo(() => allMatches.map((m: any) => ({
    id: m.matchId ?? m._id,
    sportName: m.sportId ?? "General",
    team1: { name: m.team1?.name ?? "Team 1", score: m.team1?.score ?? 0 },
    team2: { name: m.team2?.name ?? "Team 2", score: m.team2?.score ?? 0 },
    status: m.status ?? "scheduled",
    createdAt: m.createdAt ?? new Date().toISOString(),
    court: m.court ?? "",
    time: m.scheduledTime ?? m.createdAt ?? new Date().toISOString(),
    eventName: m.competitionName ?? m.competitionId ?? "",
  })), [allMatches]);

  // Build bracket matches from matches that have round/matchIndex data
  const bracketMatches = useMemo(() => allMatches
    .filter((m: any) => m.round !== undefined || m.roundIndex !== undefined)
    .map((m: any) => ({
      id: m.matchId ?? m._id,
      team1: { name: m.team1?.name ?? "TBD", score: m.team1?.score },
      team2: { name: m.team2?.name ?? "TBD", score: m.team2?.score },
      winner: m.winner,
      round: m.round ?? "",
      roundIndex: m.roundIndex ?? 0,
      matchIndex: m.matchIndex ?? 0,
      status: m.status ?? "scheduled",
    })), [allMatches]);

  // Extract unique courts from matches
  const courts = useMemo(() => {
    const courtSet = new Set<string>();
    allMatches.forEach((m: any) => {
      if (m.court) courtSet.add(m.court);
    });
    return courtSet.size > 0 ? Array.from(courtSet).sort() : ["Court 1"];
  }, [allMatches]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [printMode, setPrintMode] = useState<"selection" | "preview">("selection");

  const printOptions = [
    {
      id: "schedule",
      label: "Full Match Schedule",
      description: "All matches organized by date",
      icon: Calendar,
      type: "schedule",
    },
    {
      id: "courts",
      label: "Court Assignments",
      description: "Matches organized by court/table",
      icon: MapPin,
      type: "courts",
    },
    {
      id: "bracket",
      label: "Tournament Bracket",
      description: "Bracket view with progression",
      icon: Trophy,
      type: "bracket",
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedItems(printOptions.map((opt) => opt.id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 screen-only">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Print Center</h1>
        <p className="text-muted-foreground">
          Generate printable schedules, brackets, and court assignments
        </p>
      </div>

      {/* Print Options */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Selection Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Items to Print</CardTitle>
                <CardDescription>
                  Choose what you want to include in your print job
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {printOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedItems.includes(option.id);
              
              return (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleItem(option.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleItem(option.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <Label className="font-semibold cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Print Actions</CardTitle>
            <CardDescription>
              Print or download your selected items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
              </p>
              <ul className="space-y-1">
                {selectedItems.map((id) => {
                  const option = printOptions.find((o) => o.id === id);
                  return option ? (
                    <li key={id} className="text-sm flex items-center gap-2">
                      <option.icon className="w-4 h-4 text-primary" />
                      {option.label}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handlePrint}
                disabled={selectedItems.length === 0}
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Selected
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                disabled={selectedItems.length === 0}
                onClick={() => {
                  // In production, this would generate a PDF
                  alert("PDF generation coming soon! Use Print to PDF in your browser for now.");
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download as PDF
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 Tip: Use "Print to PDF" in your browser's print dialog to save as PDF</p>
              <p>📄 Pages are optimized for Letter (8.5" x 11") paper</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Preview Section - Hidden on screen, visible in print */}
      <div className="print-only">
        {selectedItems.includes("schedule") && (
          <div className="mb-12">
            <PrintableSchedule
              matches={printMatches}
              tournamentName="Scorr Studio Tournament"
              qrUrl="https://scorr.studio/tournament/abc123"
              groupByDate={true}
            />
          </div>
        )}

        {selectedItems.includes("courts") && (
          <div className="mb-12">
            <PrintableCourtAssignments
              matches={printMatches}
              tournamentName="Scorr Studio Tournament"
              qrUrl="https://scorr.studio/tournament/abc123"
              courts={courts}
            />
          </div>
        )}

        {selectedItems.includes("bracket") && (
          <div className="mb-12">
            <PrintableBracket
              matches={bracketMatches}
              tournamentName="Scorr Studio Tournament"
              qrUrl="https://scorr.studio/tournament/abc123/bracket"
              bracketType="single"
            />
          </div>
        )}
      </div>
    </div>
  );
}
