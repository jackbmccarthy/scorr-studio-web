"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ExternalLink, 
  GripVertical, 
  Edit2, 
  Trash2,
  Plus,
  Crown,
  Award,
  Medal,
  Image as ImageIcon
} from "lucide-react";

// Sponsor Card
interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  displayOnScoreboard: boolean;
  displayOnPrint: boolean;
  displayOnStream: boolean;
}

interface SponsorCardProps {
  sponsor: Sponsor;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SponsorCard({
  sponsor,
  onEdit,
  onDelete,
  className,
}: SponsorCardProps) {
  const tierConfig = getTierConfig(sponsor.tier);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn("group relative", className)}
    >
      <Card className={cn(
        "overflow-hidden transition-all",
        "hover:shadow-lg",
        tierConfig.borderClass
      )}>
        {/* Tier Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            className={cn(
              "text-[10px] font-semibold uppercase gap-1",
              tierConfig.badgeClass
            )}
          >
            {tierConfig.icon}
            {sponsor.tier}
          </Badge>
        </div>

        {/* Logo */}
        <div className={cn(
          "h-32 flex items-center justify-center p-6",
          tierConfig.bgClass
        )}>
          {sponsor.logoUrl ? (
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">No logo</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-bold text-lg font-display mb-2">{sponsor.name}</h3>

          {/* Display Locations */}
          <div className="flex flex-wrap gap-1 mb-3">
            {sponsor.displayOnScoreboard && (
              <Badge variant="outline" className="text-[10px]">Scoreboard</Badge>
            )}
            {sponsor.displayOnPrint && (
              <Badge variant="outline" className="text-[10px]">Print</Badge>
            )}
            {sponsor.displayOnStream && (
              <Badge variant="outline" className="text-[10px]">Stream</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {sponsor.website && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(sponsor.website, "_blank")}
                className="h-8 px-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
            <div className="flex-1" />
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 px-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Sponsor Rotation Display
interface SponsorRotationProps {
  sponsors: Sponsor[];
  interval?: number;
  className?: string;
}

export function SponsorRotation({
  sponsors,
  interval = 10000,
  className,
}: SponsorRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sponsors.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, interval);

    return () => clearInterval(timer);
  }, [sponsors.length, interval]);

  if (sponsors.length === 0) return null;

  const currentSponsor = sponsors[currentIndex];
  if (!currentSponsor) return null;

  return (
    <motion.div
      key={currentSponsor.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("flex items-center gap-3", className)}
    >
      {currentSponsor.logoUrl ? (
        <img
          src={currentSponsor.logoUrl}
          alt={currentSponsor.name}
          className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
        />
      ) : (
        <span className="text-sm text-muted-foreground font-display">
          {currentSponsor.name}
        </span>
      )}
    </motion.div>
  );
}

// Sponsor Grid
interface SponsorGridProps {
  sponsors: Sponsor[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  className?: string;
}

export function SponsorGrid({
  sponsors,
  onEdit,
  onDelete,
  onAdd,
  className,
}: SponsorGridProps) {
  // Group by tier
  const tierGroups = sponsors.reduce<Record<string, Sponsor[]>>((acc, sponsor) => {
    if (!acc[sponsor.tier]) acc[sponsor.tier] = [];
    acc[sponsor.tier].push(sponsor);
    return acc;
  }, {});

  const tierOrder = ["platinum", "gold", "silver", "bronze"];

  return (
    <div className={cn("space-y-8", className)}>
      {tierOrder.map((tier) => {
        const tierSponsors = tierGroups[tier] || [];
        if (tierSponsors.length === 0) return null;

        const tierConfig = getTierConfig(tier);

        return (
          <div key={tier}>
            {/* Tier Header */}
            <div className="flex items-center gap-2 mb-4">
              <tierConfig.iconComponent className={cn("w-5 h-5", tierConfig.textClass)} />
              <h3 className={cn("font-bold uppercase tracking-wide font-display", tierConfig.textClass)}>
                {tier} Sponsors
              </h3>
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {tierSponsors.length}
              </span>
            </div>

            {/* Sponsors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierSponsors.map((sponsor) => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  onEdit={() => onEdit?.(sponsor.id)}
                  onDelete={() => onDelete?.(sponsor.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Add Sponsor Button */}
      {onAdd && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdd}
          className="w-full p-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center gap-2 text-muted-foreground"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium font-display">Add Sponsor</span>
        </motion.button>
      )}
    </div>
  );
}

// Helper function for tier configuration
function getTierConfig(tier: string) {
  switch (tier) {
    case "platinum":
      return {
        icon: <Crown className="w-3 h-3" />,
        iconComponent: Crown,
        textClass: "text-slate-300",
        bgClass: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
        borderClass: "border-slate-300 dark:border-slate-700",
        badgeClass: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      };
    case "gold":
      return {
        icon: <Award className="w-3 h-3" />,
        iconComponent: Award,
        textClass: "text-yellow-500",
        bgClass: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
        borderClass: "border-yellow-300 dark:border-yellow-700",
        badgeClass: "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
      };
    case "silver":
      return {
        icon: <Medal className="w-3 h-3" />,
        iconComponent: Medal,
        textClass: "text-gray-400",
        bgClass: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20",
        borderClass: "border-gray-300 dark:border-gray-700",
        badgeClass: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      };
    case "bronze":
      return {
        icon: <Star className="w-3 h-3" />,
        iconComponent: Star,
        textClass: "text-orange-400",
        bgClass: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
        borderClass: "border-orange-300 dark:border-orange-700",
        badgeClass: "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
      };
    default:
      return {
        icon: <Star className="w-3 h-3" />,
        iconComponent: Star,
        textClass: "text-muted-foreground",
        bgClass: "bg-muted",
        borderClass: "border-border",
        badgeClass: "bg-muted text-muted-foreground",
      };
  }
}

// Import useState and useEffect
import { useState, useEffect } from "react";

export default SponsorCard;
