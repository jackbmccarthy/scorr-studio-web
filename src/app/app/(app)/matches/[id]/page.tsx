// Match Scoring Page - Broadcast-Grade Design

"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Button, 
  Card, 
  CardContent, 
  Badge,
} from "@/components/ui";
import { getSportConfig, getAllSports } from "@/lib/sports";
import { ArrowLeft, Play, Square, RotateCcw, Users, Minus, Plus, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function MatchScoringContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.id as string;
  const sportId = searchParams.get("sport") || "table-tennis";
  
  const sport = getSportConfig(sportId);
  const [matchState, setMatchState] = useState(sport?.getInitialState() || null);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize match state
  useEffect(() => {
    if (sport) {
      const initialState = sport.getInitialState({
        team1: { name: "Player 1" },
        team2: { name: "Player 2" },
      });
      setMatchState(initialState);
    }
  }, [sport]);

  if (!sport || !matchState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-xl text-muted-foreground mb-4">Sport not found</p>
          <Link href="/app/matches/new">
            <Button size="lg">Select a Sport</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleAction = (actionType: string, payload?: unknown) => {
    const newState = sport.handleAction(matchState, { type: actionType, payload });
    setMatchState(newState);
  };

  const handleStartMatch = () => {
    handleAction("START_MATCH");
    setIsRunning(true);
  };

  const handleEndMatch = () => {
    handleAction("END_MATCH");
    setIsRunning(false);
  };

  const handleResetMatch = () => {
    const initialState = sport.getInitialState({
      team1: { name: matchState.teamName1 },
      team2: { name: matchState.teamName2 },
    });
    setMatchState(initialState);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/app/matches">
                <Button variant="ghost" size="icon" className="hover:bg-accent/20">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm px-3 py-1 border-border font-medium">
                  {sport.name}
                </Badge>
                {matchState.eventName && (
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {matchState.eventName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
                className="hidden sm:flex"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print
              </Button>
              {matchState.status === "live" && (
                <Badge className="bg-red-500 border-red-500 glow-live text-sm px-3 py-1">
                  <span className="animate-pulse mr-2">●</span> LIVE
                </Badge>
              )}
              {matchState.status === "finished" && (
                <Badge variant="secondary" className="text-sm px-3 py-1">Final</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Scoreboard */}
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* MASSIVE Score Display */}
        <Card className="max-w-4xl mx-auto overflow-hidden border-border">
          <CardContent className="p-0">
            <div className="grid grid-cols-3 gap-0">
              {/* Team 1 */}
              <motion.div 
                className="p-6 lg:p-10 text-center relative"
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
              >
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                    {matchState.teamAbbrev1}
                  </p>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-8 truncate px-4">
                  {matchState.teamName1}
                </h2>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={matchState.team1Score}
                      initial={{ opacity: 0, y: -30, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="score-display text-primary"
                    >
                      {matchState.team1Score}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Decorative line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20" />
              </motion.div>
              
              {/* VS / Timer */}
              <div className="p-6 lg:p-10 text-center flex flex-col items-center justify-center border-x border-border bg-card/50">
                {matchState.clock && (
                  <div className="text-4xl lg:text-6xl font-mono font-bold mb-3 text-foreground">
                    {Math.floor(matchState.clock.seconds / 60)
                      .toString()
                      .padStart(2, "0")}
                    <span className="animate-pulse mx-1">:</span>
                    {(matchState.clock.seconds % 60).toString().padStart(2, "0")}
                  </div>
                )}
                {matchState.period && (
                  <Badge variant="secondary" className="text-base px-4 py-1.5">
                    Period {matchState.period}
                  </Badge>
                )}
                {!matchState.clock && !matchState.period && (
                  <div className="text-3xl font-display font-bold text-muted-foreground">
                    VS
                  </div>
                )}
              </div>
              
              {/* Team 2 */}
              <motion.div 
                className="p-6 lg:p-10 text-center relative"
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
              >
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                    {matchState.teamAbbrev2}
                  </p>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-8 truncate px-4">
                  {matchState.teamName2}
                </h2>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={matchState.team2Score}
                      initial={{ opacity: 0, y: -30, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 30, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="score-display text-foreground"
                    >
                      {matchState.team2Score}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Decorative line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10" />
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Controls */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="border-border">
            <CardContent className="p-6 lg:p-8">
              {/* Score Buttons - Touch-Friendly */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction("SCORE", { team: "team1" })}
                  disabled={matchState.status === "finished"}
                  className="h-20 lg:h-24 rounded-xl bg-primary text-primary-foreground text-xl lg:text-2xl font-bold transition-all hover:glow-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
                  {matchState.teamAbbrev1}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction("SCORE", { team: "team2" })}
                  disabled={matchState.status === "finished"}
                  className="h-20 lg:h-24 rounded-xl bg-secondary text-secondary-foreground text-xl lg:text-2xl font-bold transition-all hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
                  {matchState.teamAbbrev2}
                </motion.button>
              </div>

              {/* Undo Points */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleAction("UNDO_SCORE", { team: "team1" })}
                  disabled={matchState.status === "finished"}
                  className="h-14 lg:h-16 text-base border-border hover:border-accent"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Undo {matchState.teamAbbrev1}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleAction("UNDO_SCORE", { team: "team2" })}
                  disabled={matchState.status === "finished"}
                  className="h-14 lg:h-16 text-base border-border hover:border-accent"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Undo {matchState.teamAbbrev2}
                </Button>
              </div>

              {/* Match Control */}
              <div className="flex justify-center gap-4">
                {matchState.status === "scheduled" && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" onClick={handleStartMatch} className="h-14 px-8 text-base glow-accent">
                      <Play className="w-5 h-5 mr-2" />
                      Start Match
                    </Button>
                  </motion.div>
                )}
                
                {matchState.status === "live" && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="destructive" onClick={handleEndMatch} className="h-14 px-8 text-base glow-live">
                      <Square className="w-5 h-5 mr-2" />
                      End Match
                    </Button>
                  </motion.div>
                )}
                
                {matchState.status === "finished" && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="outline" onClick={handleResetMatch} className="h-14 px-8 text-base border-border">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset Match
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sport-Specific Controls */}
        {sport.id === "table-tennis" && "team1GamesWon" in matchState && (
          <div className="max-w-4xl mx-auto mt-4">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Games Won</span>
                  <div className="text-2xl font-display font-bold">
                    <span className="text-primary">{(matchState as { team1GamesWon?: number }).team1GamesWon || 0}</span>
                    <span className="text-muted-foreground mx-2">-</span>
                    <span className="text-foreground">{(matchState as { team2GamesWon?: number }).team2GamesWon || 0}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAction("WIN_GAME", { team: "team1" })}
                    disabled={matchState.status === "finished"}
                    className="h-12 border-border hover:border-accent"
                  >
                    Win Game ({matchState.teamAbbrev1})
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAction("WIN_GAME", { team: "team2" })}
                    disabled={matchState.status === "finished"}
                    className="h-12 border-border hover:border-accent"
                  >
                    Win Game ({matchState.teamAbbrev2})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(sport.id === "soccer" || sport.id === "basketball" || sport.id === "ice-hockey") && (
          <div className="max-w-4xl mx-auto mt-4">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAction("PREV_PERIOD")}
                    disabled={matchState.period <= 1}
                    className="h-12 border-border hover:border-accent"
                  >
                    Previous Period
                  </Button>
                  <div className="px-6 py-3 bg-accent/10 rounded-lg border border-border">
                    <span className="text-lg font-bold">Period {matchState.period}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAction("NEXT_PERIOD")}
                    disabled={matchState.status === "finished"}
                    className="h-12 border-border hover:border-accent"
                  >
                    Next Period
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchScoringPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-display font-bold text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    }>
      <MatchScoringContent />
    </Suspense>
  );
}
