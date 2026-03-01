"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Badge, Switch } from "@/components/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { Building2, Globe, Mail, Phone, MapPin, Save, Upload, Palette, ChevronRight, Trophy, Check, Lock, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTenant } from "@/components/tenant-provider";
import { getAllSports } from "@/lib/sports";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { tenantId, isFreePlan } = useTenant();
  const tenant = useQuery(api.tenants.getByTenantId as any, { tenantId }) as any | undefined;
  const updateSettingsMutation = useMutation(api.tenants.updateSettings as any);
  const updateEnabledSportsMutation = useMutation(api.tenants.updateEnabledSports as any);
  const isLoading = tenant === undefined;

  const allSports = getAllSports();

  const [org, setOrg] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    plan: "free",
    logo: null as string | null,
  });
  
  const [enabledSports, setEnabledSports] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSports, setIsSavingSports] = useState(false);
  const [showSportsSection, setShowSportsSection] = useState(false);
  
  const [pendingSportId, setPendingSportId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (tenant) {
      setOrg({
        name: tenant.name ?? "",
        slug: tenant.slug ?? "",
        email: tenant.settings?.email ?? "",
        phone: tenant.settings?.phone ?? "",
        website: tenant.settings?.website ?? "",
        address: tenant.settings?.address ?? "",
        city: tenant.settings?.city ?? "",
        state: tenant.settings?.state ?? "",
        zip: tenant.settings?.zip ?? "",
        country: tenant.settings?.country ?? "",
        plan: tenant.subscription?.tier ?? "free",
        logo: tenant.settings?.logo ?? null,
      });
      setEnabledSports(tenant.settings?.enabledSports ?? {});
    }
  }, [tenant]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sports") === "true") {
        setShowSportsSection(true);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation({
        tenantId,
        name: org.name || undefined,
        slug: org.slug || undefined,
        settings: {
          email: org.email,
          phone: org.phone,
          website: org.website,
          address: org.address,
          city: org.city,
          state: org.state,
          zip: org.zip,
          country: org.country,
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSport = async (sportId: string) => {
    if (isFreePlan && enabledSports[sportId]) {
      return;
    }
    
    const newEnabledSports = {
      ...enabledSports,
      [sportId]: !enabledSports[sportId],
    };
    
    if (isFreePlan) {
      const enabledCount = Object.values(newEnabledSports).filter(Boolean).length;
      if (enabledCount > 1) {
        return;
      }
    }
    
    setEnabledSports(newEnabledSports);
    
    setIsSavingSports(true);
    try {
      await updateEnabledSportsMutation({
        tenantId,
        enabledSports: newEnabledSports,
      });
    } finally {
      setIsSavingSports(false);
    }
  };

  const handleFreePlanSportSelect = (sportId: string) => {
    if (enabledSports[sportId]) {
      return;
    }
    setPendingSportId(sportId);
    setShowConfirmDialog(true);
  };

  const handleConfirmSport = async () => {
    if (!pendingSportId) return;
    
    setShowConfirmDialog(false);
    setIsSavingSports(true);
    
    try {
      const newEnabledSports = { [pendingSportId]: true };
      setEnabledSports(newEnabledSports);
      
      await updateEnabledSportsMutation({
        tenantId,
        enabledSports: newEnabledSports,
      });
    } finally {
      setIsSavingSports(false);
      setPendingSportId(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingSportId(null);
  };

  const enabledCount = Object.values(enabledSports).filter(Boolean).length;
  const hasSelectedSport = enabledCount >= 1;
  const pendingSport = pendingSportId ? allSports.find(s => s.id === pendingSportId) : null;
  const currentSportId = Object.keys(enabledSports).find(key => enabledSports[key]);
  const currentSport = currentSportId ? allSports.find(s => s.id === currentSportId) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization's profile and preferences
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="animate-pulse h-6 w-48 bg-muted rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="animate-pulse grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-10 bg-muted rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-10 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <>
        {/* Organization Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                {org.logo ? (
                  <img src={org.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {org.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 2MB. Recommended: 200x200px
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={org.name}
                  onChange={(e) => setOrg({ ...org, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={org.slug}
                  onChange={(e) => setOrg({ ...org, slug: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={org.email}
                  onChange={(e) => setOrg({ ...org, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={org.phone}
                  onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={org.website}
                  onChange={(e) => setOrg({ ...org, website: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={org.address}
                onChange={(e) => setOrg({ ...org, address: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={org.city}
                  onChange={(e) => setOrg({ ...org, city: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  value={org.state}
                  onChange={(e) => setOrg({ ...org, state: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input
                  id="zip"
                  value={org.zip}
                  onChange={(e) => setOrg({ ...org, zip: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={org.country}
                onChange={(e) => setOrg({ ...org, country: e.target.value })}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Current Plan:</span>
                  <Badge className="capitalize">{org.plan}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {isFreePlan 
                    ? "1 sport enabled. Upgrade to unlock unlimited sports."
                    : "Unlimited matches, competitions, and displays"}
                </p>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sports Management */}
        <Card id="sports-section" className={showSportsSection ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Sports
              {isFreePlan && (
                <Badge variant="secondary" className="ml-2">Free Plan: 1 sport</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isFreePlan && hasSelectedSport ? (
              <>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{currentSport?.name ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">Your selected sport</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Locked</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Cannot change sport on Free plan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your sport selection is permanent on the Free plan. Upgrade to Pro to enable multiple sports and switch between them.
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Need to change sports?</p>
                    <p className="text-xs text-muted-foreground">Upgrade to Pro for unlimited sports</p>
                  </div>
                  <Button size="sm">Upgrade</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {isFreePlan 
                    ? "Select your sport carefully. Free plans can only choose one sport and cannot change it later."
                    : "Enable the sports you want to use for your organization."}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {allSports.map((sport) => {
                    const isEnabled = enabledSports[sport.id];
                    
                    if (isFreePlan) {
                      return (
                        <motion.button
                          key={sport.id}
                          onClick={() => handleFreePlanSportSelect(sport.id)}
                          className={`relative flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                            isEnabled
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50 hover:bg-accent/50"
                          } cursor-pointer`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSavingSports}
                        >
                          <span className={`flex-1 font-medium text-sm ${isEnabled ? "text-primary" : ""}`}>
                            {sport.name}
                          </span>
                          {isEnabled && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </motion.button>
                      );
                    }
                    
                    return (
                      <motion.button
                        key={sport.id}
                        onClick={() => handleToggleSport(sport.id)}
                        className={`relative flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                          isEnabled
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        } cursor-pointer`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSavingSports}
                      >
                        <span className={`flex-1 font-medium text-sm ${isEnabled ? "text-primary" : ""}`}>
                          {sport.name}
                        </span>
                        {isEnabled && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog for Free Plan */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Sport Selection
              </DialogTitle>
              <DialogDescription>
                You're about to select <strong>{pendingSport?.name}</strong> as your sport.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Important</p>
                <p className="text-sm text-muted-foreground mt-1">
                  On the Free plan, your sport selection is <strong>permanent</strong>. You will not be able to change to a different sport later without upgrading to Pro.
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Are you sure you want to choose <strong>{pendingSport?.name}</strong>?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelConfirm}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSport} disabled={isSavingSports}>
                {isSavingSports ? "Confirming..." : "Yes, confirm selection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Branding Settings */}
        <Link href="/settings/branding">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Branding Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize colors, fonts, logos, and themes
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
