"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md text-center">
          <CardContent className="p-12">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                transition: { repeat: Infinity, duration: 2, repeatDelay: 3 }
              }}
              className="inline-block mb-6"
            >
              <div className="p-4 rounded-full bg-muted inline-block">
                <WifiOff className="w-16 h-16 text-muted-foreground" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold mb-2 font-display">
              You're Offline
            </h1>
            <p className="text-muted-foreground mb-6">
              It looks like you've lost your internet connection. 
              Some features may be unavailable until you're back online.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
