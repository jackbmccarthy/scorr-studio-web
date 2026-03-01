"use client";

import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { 
  Shield, 
  Users, 
  ChevronRight, 
  Edit, 
  Trash2, 
  MoreVertical,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamCardProps {
  id: string;
  name: string;
  shortName: string;
  color?: string;
  logoUrl?: string | null;
  wins?: number;
  losses?: number;
  draws?: number;
  playerCount: number;
  seed?: number;
  checkedIn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCheckIn?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TeamCard({
  id,
  name,
  shortName,
  color = "#3b82f6",
  logoUrl,
  wins = 0,
  losses = 0,
  draws = 0,
  playerCount,
  seed,
  checkedIn,
  onEdit,
  onDelete,
  onCheckIn,
  showActions = true,
  compact = false,
}: TeamCardProps) {
  const totalGames = wins + losses + draws;

  return (
    <Link href={`/app/teams/${id}`}>
      <Card className="group h-full transition-all hover:scale-[1.02] hover:border-primary cursor-pointer">
        <CardContent className={compact ? "p-3" : "p-5"}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Team Logo/Color */}
              <motion.div 
                className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center text-white font-bold`}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
              >
                {shortName.charAt(0)}
              </motion.div>
              <div className="min-w-0">
                <h3 className={`font-bold group-hover:text-primary transition-colors truncate ${compact ? 'text-sm' : ''}`}>
                  {name}
                </h3>
                <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                  {shortName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {seed && (
                <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                  #{seed}
                </Badge>
              )}
              {checkedIn && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                  <Check className="w-3 h-3" />
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          {!compact && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-lg font-bold text-green-500">{wins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-lg font-bold text-red-500">{losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-lg font-bold">{playerCount}</p>
                <p className="text-xs text-muted-foreground">Players</p>
              </div>
            </div>
          )}

          {/* Compact Stats */}
          {compact && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-mono">
                <span className="text-green-500">{wins}</span>
                <span>-</span>
                <span className="text-red-500">{losses}</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {playerCount}
              </span>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                {onCheckIn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCheckIn();
                    }}
                    className={checkedIn ? 'text-green-500' : ''}
                  >
                    {checkedIn ? 'Checked In' : 'Check In'}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={onDelete}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
