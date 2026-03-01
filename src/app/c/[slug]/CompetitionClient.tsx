"use client";

import { useQuery } from "convex/react";
import { anyApi } from "convex/server";
import Link from "next/link";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

interface CompetitionClientProps {
  slug: string;
}

// Use anyApi for untyped access (required without generated types)
const api = anyApi;

export default function CompetitionClient({ slug }: CompetitionClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const competition = useQuery(api.registrations.getCompetitionBySlug as any, { slug }) as any;
  const [copied, setCopied] = useState(false);

  if (competition === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Competition Not Found</h1>
          <p className="text-gray-400 mb-8">The competition you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const branding = competition.branding;
  const primaryColor = branding?.primaryColor || "#3b82f6";
  const events = competition.events || [];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: competition.name,
        text: competition.description,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: branding?.banner 
            ? `linear-gradient(to bottom, rgba(0,0,0,0.7), #0a0a0a), url(${branding.banner})`
            : `linear-gradient(135deg, ${primaryColor}20 0%, #0a0a0a 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${primaryColor} 0%, transparent 50%)`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            {branding?.logo && (
              <motion.img
                src={branding.logo}
                alt={competition.name}
                className="w-24 h-24 object-contain mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            )}

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              {competition.status === "active" ? (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full mr-2" />
                  LIVE NOW
                </Badge>
              ) : competition.status === "completed" ? (
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  Completed
                </Badge>
              ) : (
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Registration Open
                </Badge>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {competition.name}
            </motion.h1>

            {/* Description */}
            {competition.description && (
              <motion.p
                className="text-xl text-gray-300 max-w-2xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {competition.description}
              </motion.p>
            )}

            {/* Quick Info */}
            <motion.div
              className="flex flex-wrap gap-6 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {competition.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
                  <span>
                    {format(new Date(competition.startDate), "MMM d")}
                    {competition.endDate && ` - ${format(new Date(competition.endDate), "MMM d, yyyy")}`}
                  </span>
                </div>
              )}
              {competition.venueName && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                  <span>{competition.venueName}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6" style={{ color: primaryColor }} />
                Events
              </h2>

              <div className="space-y-4">
                <AnimatePresence>
                  {events.map((event: any, index: number) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="bg-[#141414] border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden"
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Event Info */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-white mb-1">
                                    {event.name}
                                  </h3>
                                  {event.category && (
                                    <span className="text-sm text-gray-400">
                                      {event.category}
                                      {event.division && ` · ${event.division}`}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {event.status === "live" ? (
                                    <Badge className="bg-red-500 animate-pulse">Live</Badge>
                                  ) : event.status === "completed" ? (
                                    <Badge variant="outline" className="border-green-500/50 text-green-500">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-gray-600">
                                      Upcoming
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Event Details */}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>
                                    {event.registeredCount || 0}
                                    {event.capacity ? ` / ${event.capacity}` : ""} registered
                                  </span>
                                </div>
                                {event.entryFee && event.entryFee > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-green-400 font-medium">
                                      ${(event.entryFee / 100).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                {event.eventType === "doubles" && (
                                  <div className="text-blue-400">Doubles Event</div>
                                )}
                              </div>

                              {/* Capacity Bar */}
                              {event.capacity && (
                                <div className="mb-4">
                                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full"
                                      style={{ 
                                        backgroundColor: event.isFull ? "#ef4444" : primaryColor,
                                        width: `${Math.min(100, ((event.registeredCount || 0) / event.capacity) * 100)}%`,
                                      }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, ((event.registeredCount || 0) / event.capacity) * 100)}%` }}
                                      transition={{ duration: 0.8, delay: index * 0.1 }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{event.registeredCount || 0} spots filled</span>
                                    {event.isFull && (
                                      <span className="text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Full - Join Waitlist
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Register Button */}
                            <div className="sm:w-40 p-6 flex sm:flex-col justify-center items-center border-t sm:border-t-0 sm:border-l border-gray-800 bg-[#0f0f0f]">
                              {event.status === "completed" ? (
                                <span className="text-gray-500 text-sm">Event Ended</span>
                              ) : event.registrationOpen === false ? (
                                <span className="text-gray-500 text-sm">Registration Closed</span>
                              ) : (
                                <Link href={`/c/${competition.slug}/register/${event._id}`}>
                                  <Button
                                    className="w-full"
                                    style={{ 
                                      backgroundColor: event.isFull ? "#6b7280" : primaryColor,
                                    }}
                                  >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {event.isFull ? "Waitlist" : "Register"}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {events.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No events available yet. Check back soon!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-[#141414] border-gray-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Share This Competition</h3>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 hover:border-gray-600"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {copied ? "Link Copied!" : "Share Link"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Venue Info */}
            {(competition.venueName || competition.venueAddress) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-[#141414] border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                      Venue
                    </h3>
                    {competition.venueName && (
                      <p className="font-medium text-white">{competition.venueName}</p>
                    )}
                    {competition.venueAddress && (
                      <p className="text-gray-400 text-sm mt-1">{competition.venueAddress}</p>
                    )}
                    {competition.venueAddress && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(competition.venueAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm mt-3 hover:underline"
                        style={{ color: primaryColor }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Map
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Sponsors */}
            {branding?.sponsorLogos && branding.sponsorLogos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-[#141414] border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Sponsors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {branding.sponsorLogos.map((sponsor: any, index: number) => (
                        <a
                          key={index}
                          href={sponsor.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                        >
                          <img
                            src={sponsor.imageUrl}
                            alt={sponsor.name}
                            className="max-h-12 max-w-full object-contain grayscale hover:grayscale-0 transition-all"
                          />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Social Links */}
            {branding?.socialLinks && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-[#141414] border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Follow Us</h3>
                    <div className="flex gap-3">
                      {branding.socialLinks.twitter && (
                        <a
                          href={branding.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                      {branding.socialLinks.instagram && (
                        <a
                          href={branding.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              Powered by <span style={{ color: primaryColor }}>Scorr Studio</span>
            </p>
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
