"use client";

import Link from "next/link";
import { Card, CardContent, Badge, Button, Avatar, AvatarFallback } from "@/components/ui";
import { 
  Star, 
  Mail, 
  Phone,
  MoreVertical,
  Edit,
  Trash2,
  Crown,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlayerCardProps {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  number?: string;
  position?: string;
  rating?: number;
  ratingSystem?: string;
  wins?: number;
  losses?: number;
  totalMatches?: number;
  isCaptain?: boolean;
  teamName?: string;
  tags?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function PlayerCard({
  id,
  name,
  email,
  phone,
  avatarUrl,
  number,
  position,
  rating,
  ratingSystem,
  wins = 0,
  losses = 0,
  totalMatches = 0,
  isCaptain,
  teamName,
  tags = [],
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
}: PlayerCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <Link href={`/app/players/${id}`}>
      <Card className="group h-full transition-all hover:scale-[1.02] hover:border-primary cursor-pointer">
        <CardContent className={compact ? "p-3" : "p-5"}>
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Avatar className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} border-2 border-border`}>
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isCaptain && (
                  <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                )}
                <h3 className={`font-bold group-hover:text-primary transition-colors truncate ${compact ? 'text-sm' : ''}`}>
                  {name}
                </h3>
              </div>
              
              {/* Rating */}
              {rating !== undefined && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{rating}</span>
                  {ratingSystem && (
                    <span className="text-xs">({ratingSystem.toUpperCase()})</span>
                  )}
                </div>
              )}

              {/* Number and Position */}
              {(number || position) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  {number && (
                    <Badge variant="outline" className="font-mono text-xs">
                      #{number}
                    </Badge>
                  )}
                  {position && (
                    <span>{position}</span>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {showActions && (
              <div onClick={(e) => e.preventDefault()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            )}
          </div>

          {/* Tags */}
          {!compact && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          {!compact && totalMatches > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-lg font-bold">{totalMatches}</p>
                <p className="text-xs text-muted-foreground">Matches</p>
              </div>
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-lg font-bold text-green-500">{wins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-lg font-bold text-red-500">{losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
            </div>
          )}

          {/* Team */}
          {teamName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span className="truncate">{teamName}</span>
            </div>
          )}

          {/* Contact (compact mode) */}
          {compact && (email || phone) && (
            <div className="mt-2 pt-2 border-t border-border space-y-1">
              {email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
