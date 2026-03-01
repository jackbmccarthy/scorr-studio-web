"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode | {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  // Check if action is a ReactNode or an action object
  const isReactNode = (val: typeof action): val is ReactNode => {
    return val !== null && val !== undefined && typeof val !== 'object';
  };
  
  const actionObject = action && typeof action === 'object' && 'label' in action ? action : null;
  const actionElement = action && isReactNode(action) ? action : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {description}
        </p>
      )}
      {actionElement && <div className="mt-2">{actionElement}</div>}
      {actionObject && (
        <div className="mt-2">
          {actionObject.href ? (
            <Link href={actionObject.href}>
              <Button>{actionObject.label}</Button>
            </Link>
          ) : (
            <Button onClick={actionObject.onClick}>{actionObject.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common use cases
interface EmptyStatePresetProps {
  className?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyMatches({ className, action }: EmptyStatePresetProps) {
  const Calendar = require("lucide-react").Calendar;
  return (
    <EmptyState
      icon={Calendar}
      title="No matches found"
      description="Create your first match to start tracking scores and results."
      action={action || { label: "Create Match", href: "/app/matches/new" }}
      className={className}
    />
  );
}

export function EmptyCompetitions({ className, action }: EmptyStatePresetProps) {
  const Trophy = require("lucide-react").Trophy;
  return (
    <EmptyState
      icon={Trophy}
      title="No competitions yet"
      description="Create a competition to organize tournaments and events."
      action={action || { label: "Create Competition", href: "/app/competitions/new" }}
      className={className}
    />
  );
}

export function EmptyLeagues({ className, action }: EmptyStatePresetProps) {
  const Users = require("lucide-react").Users;
  return (
    <EmptyState
      icon={Users}
      title="No leagues yet"
      description="Create a league to manage season-long competitions with standings."
      action={action || { label: "Create League", href: "/app/leagues/new" }}
      className={className}
    />
  );
}

export function EmptyDisplays({ className, action }: EmptyStatePresetProps) {
  const MonitorPlay = require("lucide-react").MonitorPlay;
  return (
    <EmptyState
      icon={MonitorPlay}
      title="No displays configured"
      description="Set up displays to broadcast live scores and schedules."
      action={action || { label: "Create Display", href: "/app/displays/new" }}
      className={className}
    />
  );
}

export function EmptyTeam({ className, action }: EmptyStatePresetProps) {
  const UserPlus = require("lucide-react").UserPlus;
  return (
    <EmptyState
      icon={UserPlus}
      title="No team members"
      description="Invite team members to help manage your organization."
      action={action || { label: "Invite Member", onClick: () => {} }}
      className={className}
    />
  );
}

export function EmptyTeams({ className, action }: EmptyStatePresetProps) {
  const Shield = require("lucide-react").Shield;
  return (
    <EmptyState
      icon={Shield}
      title="No teams yet"
      description="Create your first team to start managing rosters and tracking stats."
      action={action || { label: "Create Team", href: "/app/teams/new" }}
      className={className}
    />
  );
}

export function EmptyPlayers({ className, action }: EmptyStatePresetProps) {
  const Users = require("lucide-react").Users;
  return (
    <EmptyState
      icon={Users}
      title="No players yet"
      description="Add players to your organization to build your athlete database."
      action={action || { label: "Add Player", href: "/app/players" }}
      className={className}
    />
  );
}
