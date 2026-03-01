"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Smartphone, MessageSquare, Clock, Calendar, Trophy, Megaphone, CheckCircle, RotateCcw, Save } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Switch, Label, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface NotificationPreferences {
  // Global toggles
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  // Per-type preferences
  matchReminders: boolean;
  registrationConfirmations: boolean;
  scheduleChanges: boolean;
  matchResults: boolean;
  announcements: boolean;
}

const defaultPreferences: NotificationPreferences = {
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false,
  matchReminders: true,
  registrationConfirmations: true,
  scheduleChanges: true,
  matchResults: true,
  announcements: true,
};

const notificationTypes = [
  {
    key: "matchReminders",
    icon: Clock,
    title: "Match Reminders",
    description: "Get notified 1 hour before your scheduled matches",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    key: "registrationConfirmations",
    icon: CheckCircle,
    title: "Registration Confirmations",
    description: "Receive confirmation when you register for events",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    key: "scheduleChanges",
    icon: Calendar,
    title: "Schedule Changes",
    description: "Get notified when match times or courts are changed",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    key: "matchResults",
    icon: Trophy,
    title: "Match Results",
    description: "Receive notifications when match results are posted",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "announcements",
    icon: Megaphone,
    title: "Announcements",
    description: "General announcements from organizers",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const isTypeEnabled = (key: keyof NotificationPreferences): boolean => {
    // A type is enabled if at least one global channel is enabled
    return (preferences.emailEnabled || preferences.pushEnabled || preferences.smsEnabled) && preferences[key];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Notification Preferences
            </h1>
            <p className="text-muted-foreground mt-1">
              Choose how you want to receive notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={!hasChanges}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={savePreferences}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Delivery Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Channels</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Email */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) => updatePreference("emailEnabled", checked)}
                />
              </div>

              {/* Push */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your devices
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.pushEnabled}
                  onCheckedChange={(checked) => updatePreference("pushEnabled", checked)}
                />
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">SMS Notifications</p>
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive text messages for important updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.smsEnabled}
                  onCheckedChange={(checked) => updatePreference("smsEnabled", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Types</CardTitle>
            <CardDescription>
              Select which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationTypes.map((type, index) => {
                const Icon = type.icon;
                const isEnabled = preferences[type.key as keyof NotificationPreferences];
                const isChannelEnabled = preferences.emailEnabled || preferences.pushEnabled || preferences.smsEnabled;

                return (
                  <motion.div
                    key={type.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg transition-colors",
                      isEnabled && isChannelEnabled
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg", type.bgColor)}>
                        <Icon className={cn("w-5 h-5", type.color)} />
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium",
                          !isChannelEnabled && "text-muted-foreground"
                        )}>
                          {type.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => 
                        updatePreference(type.key as keyof NotificationPreferences, checked)
                      }
                      disabled={!isChannelEnabled}
                    />
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Notification Settings</p>
                <p>
                  Match reminders are sent 1 hour before your scheduled match. 
                  Schedule change notifications are sent immediately when organizers 
                  update match times or court assignments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <Card className="bg-primary border-primary shadow-lg">
            <CardContent className="p-3 flex items-center gap-3">
              <p className="text-sm text-primary-foreground">
                You have unsaved changes
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={savePreferences}
                disabled={isSaving}
              >
                Save Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
