"use client";

import { useState } from "react";
import { Card, CardContent, Badge, Button, Avatar, AvatarFallback, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { 
  Users,
  Plus,
  GripVertical,
  Crown,
  MoreVertical,
  Edit,
  Trash2,
  UserMinus,
  Search,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Player {
  playerId: string;
  name: string;
  number?: string;
  position?: string;
  isCaptain?: boolean;
}

interface RosterManagerProps {
  teamId: string;
  teamName: string;
  players: Player[];
  onReorder?: (players: Player[]) => void;
  onAddPlayer?: () => void;
  onRemovePlayer?: (playerId: string) => void;
  onUpdatePlayer?: (playerId: string, updates: Partial<Player>) => void;
  onSetCaptain?: (playerId: string) => void;
  readonly?: boolean;
}

export function RosterManager({
  teamId,
  teamName,
  players: initialPlayers,
  onReorder,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
  onSetCaptain,
  readonly = false,
}: RosterManagerProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleReorder = (newOrder: typeof players) => {
    setPlayers(newOrder);
    onReorder?.(newOrder);
  };

  const handleRemove = (playerId: string) => {
    setPlayers(players.filter((p) => p.playerId !== playerId));
    onRemovePlayer?.(playerId);
  };

  const handleSetCaptain = (playerId: string) => {
    const updatedPlayers = players.map((p) => ({
      ...p,
      isCaptain: p.playerId === playerId,
    }));
    setPlayers(updatedPlayers);
    onSetCaptain?.(playerId);
  };

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Roster</h2>
            <Badge variant="secondary" className="ml-2">{players.length}</Badge>
          </div>
          
          {!readonly && (
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          )}
        </div>

        {/* Search */}
        {players.length > 5 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Player List with Drag & Drop */}
        {readonly ? (
          <div className="space-y-2">
            {filteredPlayers.map((player) => (
              <PlayerRow
                key={player.playerId}
                player={player}
                readonly
              />
            ))}
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={players}
            onReorder={handleReorder}
            className="space-y-2"
          >
            <AnimatePresence>
              {filteredPlayers.map((player) => (
                <Reorder.Item
                  key={player.playerId}
                  value={player}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <PlayerRow
                    player={player}
                    onRemove={() => handleRemove(player.playerId)}
                    onSetCaptain={() => handleSetCaptain(player.playerId)}
                    onEdit={() => setEditingPlayer(player.playerId)}
                  />
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}

        {/* Empty State */}
        {players.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No players on roster</p>
            {!readonly && (
              <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Player
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* Add Player Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to {teamName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Search Players</Label>
              <Input placeholder="Search by name or email..." className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number</Label>
                <Input placeholder="#" className="mt-1.5" />
              </div>
              <div>
                <Label>Position</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forward">Forward</SelectItem>
                    <SelectItem value="midfielder">Midfielder</SelectItem>
                    <SelectItem value="defender">Defender</SelectItem>
                    <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowAddDialog(false);
                onAddPlayer?.();
              }}>
                Add Player
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Internal player row component
interface PlayerRowProps {
  player: Player;
  onRemove?: () => void;
  onSetCaptain?: () => void;
  onEdit?: () => void;
  readonly?: boolean;
}

function PlayerRow({ player, onRemove, onSetCaptain, onEdit, readonly }: PlayerRowProps) {
  const initials = player.name.split(' ').map(n => n[0]).join('');

  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all group"
      whileHover={{ scale: readonly ? 1 : 1.01 }}
    >
      {!readonly && (
        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-primary/20 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {player.isCaptain && (
            <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
          )}
          <span className="font-medium truncate">{player.name}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {player.position || 'No position'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {player.number && (
          <Badge variant="outline" className="font-mono">
            #{player.number}
          </Badge>
        )}

        {!readonly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSetCaptain}>
                <Crown className="w-4 h-4 mr-2" />
                Set as Captain
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onRemove}
                className="text-red-500 focus:text-red-500"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
  );
}
