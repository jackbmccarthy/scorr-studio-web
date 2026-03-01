"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, ExternalLink, X, AlertCircle, Calendar, Trophy, Clock, Megaphone } from "lucide-react";
import Link from "next/link";
import { Button, Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

// Notification type configuration
const notificationTypes = {
  match_reminder: { icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  registration_confirm: { icon: Check, color: "text-green-500", bgColor: "bg-green-500/10" },
  schedule_change: { icon: Calendar, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  match_result: { icon: Trophy, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  announcement: { icon: Megaphone, color: "text-purple-500", bgColor: "bg-purple-500/10" },
};

interface Notification {
  _id: string;
  notificationId: string;
  type: keyof typeof notificationTypes;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

interface NotificationBellProps {
  userId: string;
  className?: string;
}

// Mock data for demonstration - will be replaced with Convex query
const mockNotifications: Notification[] = [
  {
    _id: "1",
    notificationId: "n1",
    type: "match_reminder",
    title: "Match Starting Soon",
    message: "Your match vs Team Alpha starts in 1 hour",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    _id: "2",
    notificationId: "n2",
    type: "match_result",
    title: "Match Complete",
    message: "You won! Final score: 21-15, 21-18",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: "3",
    notificationId: "n3",
    type: "schedule_change",
    title: "Schedule Updated",
    message: "Your match has been moved to Court 3",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell({ userId, className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, read: true } : n
      )
    );
    // In production: await convex.mutation(api.notifications.markAsRead, { notificationId });
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // In production: await convex.mutation(api.notifications.markAllAsRead, { userId });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-secondary/80 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50"
            >
              <Card className="bg-card border-border shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold font-display">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Bell className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((notification) => {
                        const typeConfig = notificationTypes[notification.type] || notificationTypes.announcement;
                        const Icon = typeConfig.icon;

                        return (
                          <div
                            key={notification._id}
                            className={cn(
                              "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
                              !notification.read && "bg-primary/5"
                            )}
                            onClick={() => markAsRead(notification.notificationId)}
                          >
                            <div className="flex gap-3">
                              {/* Icon */}
                              <div className={cn("flex-shrink-0 p-2 rounded-lg", typeConfig.bgColor)}>
                                <Icon className={cn("w-4 h-4", typeConfig.color)} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={cn(
                                    "text-sm font-medium truncate",
                                    !notification.read && "text-foreground",
                                    notification.read && "text-muted-foreground"
                                  )}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                  {formatRelativeTime(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border bg-secondary/30">
                  <Link
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View all notifications
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
