"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, CardContent, Badge, Input, EmptyState } from "@/components/ui";
import {
  Plus,
  Search,
  Monitor,
  Settings,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTenant } from "@/components/tenant-provider";

export default function DisplaysPage() {
  const { tenantId } = useTenant();
  const displays = useQuery(api.displays.list as any, { tenantId }) as any[] | undefined;
  const isLoading = displays === undefined;

  const [search, setSearch] = useState("");

  const allDisplays = displays ?? [];

  const filteredDisplays = allDisplays.filter((display: any) =>
    (display.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (display: any) => {
    // Determine status based on display data
    const status = display.status ?? (display.matchId ? "active" : "idle");
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "idle":
        return <Badge variant="secondary">Idle</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Score Displays</h1>
          <p className="text-muted-foreground mt-1">
            Manage live scoreboard displays
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Display
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search displays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Displays List */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-muted rounded" />
                      <div className="h-5 w-32 bg-muted rounded" />
                    </div>
                    <div className="h-5 w-16 bg-muted rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 flex-1 bg-muted rounded" />
                    <div className="h-9 flex-1 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDisplays.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="No displays found"
          description={search ? "Try adjusting your search" : "Create your first display to get started"}
          action={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Display
            </Button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDisplays.map((display: any) => (
            <Card key={display._id} className="hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{display.name}</h3>
                  </div>
                  {getStatusBadge(display)}
                </div>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  {display.type && (
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-foreground">{display.type}</span>
                    </div>
                  )}
                  {display.width && display.height && (
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span className="font-medium text-foreground">
                        {display.width}x{display.height}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/app/displays/${display.displayId ?? display._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/display/${display.displayId ?? display._id}`} target="_blank" className="flex-1">
                    <Button className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
