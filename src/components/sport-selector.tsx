"use client";

import { useState } from "react";
import { Button, Badge } from "@/components/ui";
import { useTenant } from "@/components/tenant-provider";
import { getAllSports } from "@/lib/sports";
import { ChevronDown, Check, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SportSelectorProps {
  compact?: boolean;
}

export function SportSelector({ compact = false }: SportSelectorProps) {
  const { currentSportId, enabledSports, isFreePlan, setCurrentSport } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const allSports = getAllSports();
  const currentSport = allSports.find(s => s.id === currentSportId);
  const enabledSportsList = allSports.filter(s => enabledSports.includes(s.id));

  const handleSwitchSport = async (sportId: string) => {
    if (sportId === currentSportId) {
      setIsOpen(false);
      return;
    }
    
    setIsSwitching(true);
    try {
      await setCurrentSport(sportId);
      setIsOpen(false);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!currentSport) {
    return (
      <Link href="/app/settings?sports=true">
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Select Sport
        </Button>
      </Link>
    );
  }

  if (isFreePlan) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
        <span className="text-sm font-medium text-primary">{currentSport.name}</span>
        <Badge variant="secondary" className="text-xs">Free Plan</Badge>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
        whileTap={{ scale: 0.98 }}
        disabled={isSwitching}
      >
        {isSwitching ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : null}
        <span className="text-sm font-medium text-primary">{currentSport.name}</span>
        <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden"
            >
              <div className="p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Your Sports ({enabledSportsList.length})
                </div>
                {enabledSportsList.map((sport) => (
                  <motion.button
                    key={sport.id}
                    onClick={() => handleSwitchSport(sport.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      sport.id === currentSportId
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent text-foreground'
                    }`}
                    whileHover={{ x: 2 }}
                    disabled={isSwitching}
                  >
                    <span className="flex-1 text-left">{sport.name}</span>
                    {sport.id === currentSportId && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="border-t border-border p-1">
                <Link
                  href="/app/settings?sports=true"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Manage Sports
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
