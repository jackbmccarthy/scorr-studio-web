"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Clock, Calendar, Trophy, Megaphone, AlertCircle, Filter, Trash2 } from "lucide-react";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

// Notification type configuration
const notificationTypes = {
  match_reminder: { icon: Clock, label: "Match Reminder", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  registration_confirm: { icon: Check, label: "Registration", color: "text-green-500", bgColor: "bg-green-500/10" },
  schedule_change: { icon: Calendar, label: "Schedule Change", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  match_result: { icon: Trophy, label: "Match Result", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  announcement: { icon: Megaphone, label: "Announcement", color: "text-purple-500", bgColor: "bg-purple-500/10" },
};

type NotificationType = keyof typeof notificationTypes;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function NotificationsPage() {
  const userId = "demo-user";
  const notifications = useQuery(api.notifications.getUserNotifications as any, { userId }) as any[] | undefined;
  const markAsReadMutation = useMutation(api.notifications.markAsRead as any);
  const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead as any);
  const deleteNotificationMutation = useMutation(api.notifications.deleteNotification as any);

  const isLoading = notifications === undefined;

  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const allNotifications = notifications ?? [];
  const unreadCount = allNotifications.filter((n: any) => !n.read).length;

  const filteredNotifications = allNotifications.filter((n: any) => {
    if (filter !== "all" && n.type !== filter) return false;
    if (showUnreadOnly && n.read) return false;
    return true;
  });

  const markAsRead = async (notificationId: string) => {
    await markAsReadMutation({ notificationId });
  };

  const markAllAsRead = async () => {
    await markAllAsReadMutation({ userId });
  };

  const deleteNotification = async (notificationId: string) => {
    await deleteNotificationMutation({ notificationId });
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups: Record<string, any[]>, notification: any) => {
    const date = formatDate(notification.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(notification);
    return groups;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">{unreadCount} unread</Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">Stay updated on your matches and events</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as NotificationType | "all")}
                  className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All types</option>
                  {Object.entries(notificationTypes).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Unread only</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-40 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedNotifications).length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm mt-1">
                  {showUnreadOnly ? "You're all caught up!" : "Notifications will appear here when you have updates"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{date}</h3>
              <div className="space-y-2">
                {(items as any[]).map((notification: any) => {
                  const typeConfig = notificationTypes[notification.type as NotificationType] ?? notificationTypes.announcement;
                  const Icon = typeConfig.icon;

                  return (
                    <Card
                      key={notification._id}
                      className={cn(
                        "transition-all hover:shadow-lg cursor-pointer group",
                        !notification.read && "border-primary/50 bg-primary/5"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={cn("flex-shrink-0 p-3 rounded-xl", typeConfig.bgColor)}>
                            <Icon className={cn("w-5 h-5", typeConfig.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={cn("font-semibold", !notification.read ? "text-foreground" : "text-muted-foreground")}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                                <Badge variant="outline" className="mt-1 text-xs">{typeConfig.label}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}>
                                  <Check className="w-4 h-4 mr-1" />
                                  Mark read
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }} className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
