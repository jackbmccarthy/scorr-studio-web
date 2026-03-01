"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { Building2, Loader2, Check, Trophy, AlertTriangle } from "lucide-react";
import { getAllSports } from "@/lib/sports";
import { motion } from "framer-motion";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth({ ensureSignedIn: true });
  const router = useRouter();
  const createTenant = useMutation(api.tenants.create);

  const [step, setStep] = useState<"org" | "sport" | "confirm">("org");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sports = getAllSports();
  const selectedSport = selectedSportId ? sports.find(s => s.id === selectedSportId) : null;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(slugify(value));
  };

  const handleContinueToSport = () => {
    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }
    setError(null);
    setStep("sport");
  };

  const handleSelectSport = (sportId: string) => {
    setSelectedSportId(sportId);
  };

  const handleConfirmSelection = () => {
    if (!selectedSportId) return;
    setStep("confirm");
  };

  const handleBackToSport = () => {
    setStep("sport");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !user || !selectedSportId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const tenantId = crypto.randomUUID();
      await createTenant({
        tenantId,
        name: name.trim(),
        slug: slug || slugify(name),
        ownerUserId: user.id,
        ownerEmail: user.email,
        ownerName: user.firstName
          ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
          : undefined,
        initialSportId: selectedSportId,
      });
      router.replace("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
      setStep("confirm");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            {step === "org" ? (
              <Building2 className="w-7 h-7 text-primary-foreground" />
            ) : (
              <Trophy className="w-7 h-7 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === "org" && "Create your organization"}
            {step === "sport" && "Select your sport"}
            {step === "confirm" && "Confirm your selection"}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {step === "org" && "Set up your organization to start managing matches and competitions."}
            {step === "sport" && "Choose the primary sport for your organization."}
            {step === "confirm" && "Please confirm your sport selection."}
          </p>
        </CardHeader>
        <CardContent>
          {step === "org" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization name</Label>
                <Input
                  id="org-name"
                  placeholder="My Sports League"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1"
                  required
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="org-slug">URL slug</Label>
                <Input
                  id="org-slug"
                  placeholder="my-sports-league"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used in public-facing URLs for your organization.
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                onClick={handleContinueToSport}
                className="w-full"
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </div>
          ) : step === "sport" ? (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg mb-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> On the Free plan, you can only select one sport. Choose carefully - you won't be able to change this later.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {sports.map((sport) => (
                  <motion.button
                    key={sport.id}
                    onClick={() => handleSelectSport(sport.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                      selectedSportId === sport.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex-1 font-medium text-sm">{sport.name}</span>
                    {selectedSportId === sport.id && (
                      <Check className="w-4 h-4" />
                    )}
                  </motion.button>
                ))}
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("org")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  className="flex-1"
                  disabled={!selectedSportId}
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                      This selection is permanent
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      On the Free plan, you cannot change your sport later. You'll need to upgrade to Pro to enable multiple sports.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">You've selected:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-lg">{selectedSport?.name}</p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBackToSport}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Change Selection
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Confirm & Create"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
