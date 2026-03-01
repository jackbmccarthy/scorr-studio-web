"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";

interface StreamOverlayProps {
  team1: {
    name: string;
    score: number;
    logoUrl?: string;
    color?: string;
  };
  team2: {
    name: string;
    score: number;
    logoUrl?: string;
    color?: string;
  };
  matchName?: string;
  competitionName?: string;
  showSponsors?: boolean;
  sponsors?: Array<{
    name: string;
    logoUrl: string;
  }>;
  sport?: string;
  className?: string;
}

export function StreamOverlay({
  team1,
  team2,
  matchName,
  competitionName,
  showSponsors = true,
  sponsors = [],
  sport,
  className,
}: StreamOverlayProps) {
  const [currentSponsor, setCurrentSponsor] = useState(0);

  // Rotate sponsors every 10 seconds
  useEffect(() => {
    if (!showSponsors || sponsors.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSponsor((prev) => (prev + 1) % sponsors.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [showSponsors, sponsors.length]);

  return (
    <div className={cn("w-full h-full relative overflow-hidden", className)}>
      {/* Main Scoreboard - Bottom Left */}
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="absolute bottom-8 left-8"
      >
        <div className="bg-gradient-to-r from-black/90 via-black/85 to-black/80 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-white/10">
          {/* Competition Name */}
          {competitionName && (
            <div className="px-4 py-1.5 bg-primary/20 border-b border-white/10">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider font-display">
                {competitionName}
              </span>
            </div>
          )}

          {/* Teams & Scores */}
          <div className="flex items-stretch">
            {/* Team 1 */}
            <div className="flex items-center gap-3 px-4 py-3">
              {team1.logoUrl ? (
                <img
                  src={team1.logoUrl}
                  alt={team1.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg font-display"
                  style={{ backgroundColor: team1.color || "#3b82f6" }}
                >
                  {team1.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="block font-bold text-white text-lg font-display max-w-[150px] truncate">
                  {team1.name}
                </span>
                {matchName && (
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">
                    {matchName}
                  </span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 px-4 py-3 bg-white/5 border-x border-white/10">
              <motion.span
                key={team1.score}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-white tabular-nums font-display w-10 text-center"
              >
                {team1.score}
              </motion.span>
              <span className="text-2xl text-white/30 font-light mx-1">-</span>
              <motion.span
                key={team2.score}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-white tabular-nums font-display w-10 text-center"
              >
                {team2.score}
              </motion.span>
            </div>

            {/* Team 2 */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div>
                <span className="block font-bold text-white text-lg font-display max-w-[150px] truncate text-right">
                  {team2.name}
                </span>
                {sport && (
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">
                    {sport}
                  </span>
                )}
              </div>
              {team2.logoUrl ? (
                <img
                  src={team2.logoUrl}
                  alt={team2.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg font-display"
                  style={{ backgroundColor: team2.color || "#ef4444" }}
                >
                  {team2.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sponsor Logo - Bottom Right */}
      <AnimatePresence>
        {showSponsors && sponsors.length > 0 && (
          <motion.div
            key={currentSponsor}
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute bottom-8 right-8"
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              {sponsors[currentSponsor]?.logoUrl ? (
                <img
                  src={sponsors[currentSponsor].logoUrl}
                  alt={sponsors[currentSponsor].name}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="h-12 w-24 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white/50 text-xs font-display">
                    {sponsors[currentSponsor]?.name}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Minimal overlay for corner display
export function StreamOverlayMinimal({
  team1,
  team2,
  className,
}: Pick<StreamOverlayProps, "team1" | "team2" | "className">) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-white/10">
        <span className="font-semibold text-white text-sm font-display max-w-[100px] truncate">
          {team1.name}
        </span>
        <motion.span
          key={team1.score}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-xl font-bold text-primary tabular-nums font-display"
        >
          {team1.score}
        </motion.span>
      </div>
      <span className="text-white/30 text-sm">vs</span>
      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-white/10">
        <motion.span
          key={team2.score}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-xl font-bold text-primary tabular-nums font-display"
        >
          {team2.score}
        </motion.span>
        <span className="font-semibold text-white text-sm font-display max-w-[100px] truncate">
          {team2.name}
        </span>
      </div>
    </div>
  );
}

// Win probability display
export function WinProbabilityOverlay({
  team1Prob,
  team2Prob,
  team1Name,
  team2Name,
  className,
}: {
  team1Prob: number;
  team2Prob: number;
  team1Name: string;
  team2Name: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn("w-80", className)}
    >
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2 font-display">
          Win Probability
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white font-display truncate max-w-[80px]">
            {team1Name}
          </span>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${team1Prob * 100}%` }}
              transition={{ type: "spring" }}
              className="bg-primary"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${team2Prob * 100}%` }}
              transition={{ type: "spring" }}
              className="bg-red-500"
            />
          </div>
          <span className="text-xs text-white font-display truncate max-w-[80px] text-right">
            {team2Name}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-primary font-mono">
            {(team1Prob * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-red-400 font-mono">
            {(team2Prob * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default StreamOverlay;
