"use client";

import { useQuery } from "convex/react";
import { anyApi } from "convex/server";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, Input, Label, Badge } from "@/components/ui";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Trophy,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, FormEvent } from "react";
import Link from "next/link";

// Use anyApi for untyped access (required without generated types)
const api = anyApi;

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const eventId = params.eventId as string;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    club: "",
    rating: "",
    division: "",
    partnerName: "",
    partnerEmail: "",
    partnerPhone: "",
    partnerClub: "",
    partnerRating: "",
    waiverAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  // Get competition info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const competition = useQuery(api.registrations.getCompetitionBySlug as any, { slug }) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = useQuery(api.registrations.getEventDetails as any, { eventId }) as any;

  const isLoading = competition === undefined || event === undefined;
  const isDoubles = event?.eventType === "doubles";
  const hasFee = event?.entryFee && event.entryFee > 0;
  const isFull = event?.isFull;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: competition.competitionId || competition._id,
          eventId,
          tenantId: competition.tenantId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          club: formData.club || undefined,
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
          division: formData.division || undefined,
          partner: isDoubles && formData.partnerName ? {
            name: formData.partnerName,
            email: formData.partnerEmail,
            phone: formData.partnerPhone || undefined,
            club: formData.partnerClub || undefined,
            rating: formData.partnerRating ? parseFloat(formData.partnerRating) : undefined,
          } : undefined,
          waiverAccepted: formData.waiverAccepted,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Free registration or waitlist
        setRegistrationResult(data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading registration...</p>
        </div>
      </div>
    );
  }

  if (!competition || !event) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-gray-400 mb-6">This event doesn't exist or registration is closed.</p>
          <Link href={`/c/${slug}`}>
            <Button variant="outline" className="border-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Competition
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = competition.branding?.primaryColor || "#3b82f6";

  // Success state
  if (registrationResult) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-[#141414] border-gray-800 text-center">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: primaryColor }} />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {registrationResult.isWaitlist ? "Added to Waitlist!" : "Registration Complete!"}
              </h2>
              <p className="text-gray-400 mb-6">
                {registrationResult.isWaitlist
                  ? "You've been added to the waitlist. We'll notify you if a spot opens up."
                  : "You're all set! Check your email for confirmation details."}
              </p>

              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-500 mb-1">Confirmation Number</p>
                <p className="text-lg font-mono text-white">{registrationResult.registrationId}</p>
              </div>

              <Link href={`/c/${slug}`}>
                <Button className="w-full" style={{ backgroundColor: primaryColor }}>
                  Back to Competition
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div 
        className="border-b border-gray-800"
        style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, transparent 100%)` }}
      >
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link 
            href={`/c/${slug}`}
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Competition
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Register for {event.name}
            </h1>
            <p className="text-gray-400">{competition.name}</p>

            {/* Event Info Badges */}
            <div className="flex flex-wrap gap-3 mt-4">
              {isDoubles && (
                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                  <Users className="w-3 h-3 mr-1" />
                  Doubles Event
                </Badge>
              )}
              {hasFee && (
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  ${(event.entryFee / 100).toFixed(2)} Entry Fee
                </Badge>
              )}
              {isFull && (
                <Badge className="bg-orange-500/20 text-orange-400 border-0">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Waitlist Only
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium">Registration Failed</p>
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Participant Info */}
          <Card className="bg-[#141414] border-gray-800 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: primaryColor }} />
                Participant Information
              </h2>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                      required
                      className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="club" className="text-gray-300">Club / Affiliation</Label>
                    <Input
                      id="club"
                      value={formData.club}
                      onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                      placeholder="ACME Club"
                      className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating" className="text-gray-300">Rating / Skill Level</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.01"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="1500"
                      className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="division" className="text-gray-300">Division</Label>
                    <Input
                      id="division"
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      placeholder="Open, A, B, C..."
                      className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Info (Doubles) */}
          {isDoubles && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-[#141414] border-gray-800 mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: primaryColor }} />
                    Partner Information
                  </h2>

                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="partnerName" className="text-gray-300">Partner Name *</Label>
                        <Input
                          id="partnerName"
                          value={formData.partnerName}
                          onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                          placeholder="Jane Doe"
                          required
                          className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partnerEmail" className="text-gray-300">Partner Email *</Label>
                        <Input
                          id="partnerEmail"
                          type="email"
                          value={formData.partnerEmail}
                          onChange={(e) => setFormData({ ...formData, partnerEmail: e.target.value })}
                          placeholder="jane@example.com"
                          required
                          className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="partnerPhone" className="text-gray-300">Partner Phone</Label>
                        <Input
                          id="partnerPhone"
                          type="tel"
                          value={formData.partnerPhone}
                          onChange={(e) => setFormData({ ...formData, partnerPhone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partnerClub" className="text-gray-300">Partner Club</Label>
                        <Input
                          id="partnerClub"
                          value={formData.partnerClub}
                          onChange={(e) => setFormData({ ...formData, partnerClub: e.target.value })}
                          placeholder="ACME Club"
                          className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="partnerRating" className="text-gray-300">Partner Rating</Label>
                      <Input
                        id="partnerRating"
                        type="number"
                        step="0.01"
                        value={formData.partnerRating}
                        onChange={(e) => setFormData({ ...formData, partnerRating: e.target.value })}
                        placeholder="1500"
                        className="bg-[#0a0a0a] border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Waiver */}
          <Card className="bg-[#141414] border-gray-800 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: primaryColor }} />
                Terms & Waiver
              </h2>

              <div className="bg-[#0a0a0a] rounded-lg p-4 max-h-48 overflow-y-auto text-sm text-gray-400 mb-4">
                <p className="mb-4">
                  By participating in this competition, I agree to the following terms:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>I am physically fit and have no medical conditions that would prevent safe participation</li>
                  <li>I will follow all rules and regulations of the competition</li>
                  <li>I accept that the organizers are not liable for any injuries or accidents</li>
                  <li>I consent to photographs and videos taken during the event</li>
                  <li>The registration fee is non-refundable unless the event is cancelled</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.waiverAccepted}
                  onChange={(e) => setFormData({ ...formData, waiverAccepted: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500"
                  required
                />
                <span className="text-gray-300">
                  I have read and agree to the terms and waiver *
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {hasFee && (
            <Card className="bg-[#141414] border-gray-800 mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>{event.name}</span>
                    <span>${(event.entryFee / 100).toFixed(2)}</span>
                  </div>
                  {isDoubles && (
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Team Entry (includes both players)</span>
                      <span>Included</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-400">${(event.entryFee / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-lg font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : hasFee ? (
              `Pay $${(event.entryFee / 100).toFixed(2)} & Register`
            ) : isFull ? (
              "Join Waitlist"
            ) : (
              "Complete Registration"
            )}
          </Button>

          <p className="text-center text-gray-500 text-sm mt-4">
            {hasFee && "Secure payment processed by Stripe"}
          </p>
        </motion.form>
      </div>
    </div>
  );
}
