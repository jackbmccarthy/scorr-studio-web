"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Twitter,
  Facebook,
  Instagram,
  Send,
  Calendar,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Edit2,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";

// Social Post
interface SocialPost {
  id: string;
  platform: "twitter" | "facebook" | "instagram";
  content: string;
  mediaUrls?: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledFor?: string;
  publishedAt?: string;
  postIdExternal?: string;
  analytics?: {
    likes: number;
    shares: number;
    comments: number;
    impressions: number;
  };
}

// Social Post Card
interface SocialPostCardProps {
  post: SocialPost;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  className?: string;
}

export function SocialPostCard({
  post,
  onEdit,
  onDelete,
  onPublish,
  className,
}: SocialPostCardProps) {
  const statusConfig = getStatusConfig(post.status);
  const PlatformIcon = getPlatformIcon(post.platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group relative", className)}
    >
      <Card className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        statusConfig.borderClass
      )}>
        {/* Header */}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlatformIcon className={cn("w-4 h-4", getPlatformColor(post.platform))} />
              <Badge className={cn("text-[10px]", statusConfig.badgeClass)}>
                {post.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && post.status === "draft" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onEdit}
                  className="h-7 px-2 opacity-0 group-hover:opacity-100"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              {onDelete && post.status !== "published" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDelete}
                  className="h-7 px-2 text-destructive opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-3">
          <p className="text-sm whitespace-pre-wrap line-clamp-4">
            {post.content}
          </p>

          {/* Media Preview */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              {post.mediaUrls.slice(0, 4).map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-muted flex items-center justify-center"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Schedule Info */}
          {post.scheduledFor && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(post.scheduledFor).toLocaleString()}
            </div>
          )}

          {/* Published Info */}
          {post.status === "published" && post.publishedAt && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              Published {new Date(post.publishedAt).toLocaleString()}
            </div>
          )}

          {/* Analytics */}
          {post.analytics && post.status === "published" && (
            <div className="flex items-center gap-3 pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                ❤️ {formatNumber(post.analytics.likes)}
              </span>
              <span className="text-xs text-muted-foreground">
                💬 {formatNumber(post.analytics.comments)}
              </span>
              <span className="text-xs text-muted-foreground">
                🔄 {formatNumber(post.analytics.shares)}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                👁 {formatNumber(post.analytics.impressions)}
              </span>
            </div>
          )}

          {/* Actions */}
          {post.status === "draft" && onPublish && (
            <Button
              size="sm"
              onClick={onPublish}
              className="w-full gap-2 mt-2"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Now
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Post Composer
interface PostComposerProps {
  platform: "twitter" | "facebook" | "instagram";
  initialContent?: string;
  onPost: (content: string, scheduledFor?: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function PostComposer({
  platform,
  initialContent = "",
  onPost,
  onCancel,
  className,
}: PostComposerProps) {
  const [content, setContent] = useState(initialContent);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const maxLength = platform === "twitter" ? 280 : 2200;
  const charCount = content.length;
  const isOverLimit = charCount > maxLength;

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    // In production, call AI API
    setTimeout(() => {
      setContent(prev => prev + " 🏆 #Sports #LiveScore");
      setIsGenerating(false);
    }, 1000);
  };

  const PlatformIcon = getPlatformIcon(platform);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <PlatformIcon className={cn("w-5 h-5", getPlatformColor(platform))} />
          <CardTitle className="text-base font-display capitalize">
            New {platform} Post
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content */}
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's happening? Write your ${platform} post...`}
            className={cn(
              "min-h-[120px] resize-none",
              isOverLimit && "border-destructive"
            )}
          />
          <div className={cn(
            "absolute bottom-2 right-2 text-xs font-mono",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}>
            {charCount}/{maxLength}
          </div>
        </div>

        {/* AI Generate */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="gap-2"
        >
          <Sparkles className={cn("w-3.5 h-3.5", isGenerating && "animate-pulse")} />
          AI Enhance
        </Button>

        {/* Schedule */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="flex-1 text-sm bg-background border rounded-md px-2 py-1"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={() => onPost(content, scheduleDate || undefined)}
            disabled={!content.trim() || isOverLimit}
            className="flex-1 gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            {scheduleDate ? "Schedule" : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Post Templates
interface PostTemplate {
  id: string;
  name: string;
  content: string;
  platform?: string;
}

interface PostTemplatesProps {
  templates: PostTemplate[];
  onSelect: (template: PostTemplate) => void;
  className?: string;
}

export function PostTemplates({
  templates,
  onSelect,
  className,
}: PostTemplatesProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">
        Quick Templates
      </h4>
      {templates.map((template) => (
        <motion.button
          key={template.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect(template)}
          className="w-full text-left p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
        >
          <span className="text-sm font-medium">{template.name}</span>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {template.content}
          </p>
        </motion.button>
      ))}
    </div>
  );
}

// Helper functions
function getPlatformIcon(platform: string) {
  switch (platform) {
    case "twitter":
      return Twitter;
    case "facebook":
      return Facebook;
    case "instagram":
      return Instagram;
    default:
      return Send;
  }
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case "twitter":
      return "text-blue-400";
    case "facebook":
      return "text-blue-600";
    case "instagram":
      return "text-pink-500";
    default:
      return "text-muted-foreground";
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "draft":
      return {
        icon: Edit2,
        textClass: "text-gray-500",
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        borderClass: "border-border",
      };
    case "scheduled":
      return {
        icon: Clock,
        textClass: "text-blue-500",
        badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        borderClass: "border-blue-500/30",
      };
    case "published":
      return {
        icon: CheckCircle,
        textClass: "text-green-500",
        badgeClass: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        borderClass: "border-green-500/30",
      };
    case "failed":
      return {
        icon: XCircle,
        textClass: "text-red-500",
        badgeClass: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        borderClass: "border-red-500/30",
      };
    default:
      return {
        icon: AlertCircle,
        textClass: "text-muted-foreground",
        badgeClass: "bg-muted text-muted-foreground",
        borderClass: "border-border",
      };
  }
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default SocialPostCard;
