"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Badge, Input, Avatar, AvatarFallback } from "@/components/ui";
import {
  Search,
  Plus,
  ChevronDown,
  Check,
  Shield,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Team {
  id: string;
  name: string;
  shortName: string;
  color?: string;
  logoUrl?: string | null;
  playerCount?: number;
}

interface TeamSelectorProps {
  teams: Team[];
  value?: string | null;
  onChange: (teamId: string | null) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showPlayerCount?: boolean;
}

export function TeamSelector({
  teams,
  value,
  onChange,
  onCreateNew,
  placeholder = "Select a team",
  disabled = false,
  showPlayerCount = true,
}: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTeam = teams.find((t) => t.id === value);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.shortName.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (teamId: string) => {
    onChange(teamId);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border bg-card
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
          ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
          transition-all
        `}
      >
        {selectedTeam ? (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: selectedTeam.color || "#3b82f6" }}
            >
              {selectedTeam.shortName.charAt(0)}
            </div>
            <div className="min-w-0 text-left">
              <p className="font-medium truncate">{selectedTeam.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedTeam.shortName}
                {showPlayerCount && selectedTeam.playerCount !== undefined && (
                  <> • {selectedTeam.playerCount} players</>
                )}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {selectedTeam && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search teams..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Team List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredTeams.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {search ? "No teams found" : "No teams available"}
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleSelect(team.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left
                      ${team.id === value ? 'bg-primary/10' : ''}
                    `}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: team.color || "#3b82f6" }}
                    >
                      {team.shortName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.shortName}
                        {showPlayerCount && team.playerCount !== undefined && (
                          <> • {team.playerCount} players</>
                        )}
                      </p>
                    </div>
                    {team.id === value && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create New Button */}
            {onCreateNew && (
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onCreateNew();
                    setIsOpen(false);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Team
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for inline use
interface TeamBadgeSelectorProps {
  teams: Team[];
  value?: string | null;
  onChange: (teamId: string | null) => void;
  placeholder?: string;
}

export function TeamBadgeSelector({
  teams,
  value,
  onChange,
  placeholder = "Add team",
}: TeamBadgeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTeam = teams.find((t) => t.id === value);

  if (selectedTeam) {
    return (
      <Badge
        className="cursor-pointer hover:bg-primary/30 transition-colors"
        style={{ backgroundColor: `${selectedTeam.color}20`, borderColor: `${selectedTeam.color}50` }}
        onClick={() => onChange(null)}
      >
        <div
          className="w-4 h-4 rounded mr-2 flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: selectedTeam.color || "#3b82f6" }}
        >
          {selectedTeam.shortName.charAt(0)}
        </div>
        {selectedTeam.shortName}
        <X className="w-3 h-3 ml-2" />
      </Badge>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <Plus className="w-3 h-3" />
        {placeholder}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    onChange(team.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left text-sm"
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: team.color || "#3b82f6" }}
                  >
                    {team.shortName.charAt(0)}
                  </div>
                  <span className="truncate">{team.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
