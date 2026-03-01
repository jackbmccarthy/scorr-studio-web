"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Plus, Edit, Trash2, Eye, Copy, Variable, Code, FileText, Save, X, AlertCircle, Check } from "lucide-react";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  _id: string;
  templateId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  createdAt: string;
  updatedAt?: string;
}

// Mock templates data
const mockTemplates: EmailTemplate[] = [
  {
    _id: "1",
    templateId: "t1",
    name: "welcome",
    subject: "Welcome to {{organizationName}}!",
    htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #3b82f6;">Welcome to {{organizationName}}!</h1>
  <p>Hi {{playerName}},</p>
  <p>Welcome to {{organizationName}}! We're excited to have you join our community.</p>
  <p>You can now register for events, view schedules, and track your matches.</p>
  <p style="margin-top: 24px;">
    <a href="{{loginUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>
  </p>
</div>`,
    textContent: `Welcome to {{organizationName}}!\n\nHi {{playerName}},\n\nWelcome to {{organizationName}}! We're excited to have you join our community.`,
    variables: ["organizationName", "playerName", "loginUrl"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    _id: "2",
    templateId: "t2",
    name: "match_reminder",
    subject: "Match Reminder: {{matchName}} in 1 hour",
    htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #ef4444;">⏰ Match Reminder</h1>
  <p>Hi {{playerName}},</p>
  <p>Your match is starting in <strong>1 hour</strong>!</p>
  <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 0;"><strong>Match:</strong> {{team1}} vs {{team2}}</p>
    <p style="margin: 8px 0 0;"><strong>Time:</strong> {{matchTime}}</p>
    <p style="margin: 8px 0 0;"><strong>Court:</strong> {{courtName}}</p>
  </div>
</div>`,
    variables: ["playerName", "matchName", "team1", "team2", "matchTime", "courtName", "matchUrl"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    _id: "3",
    templateId: "t3",
    name: "registration_confirm",
    subject: "Registration Confirmed for {{eventName}}",
    htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #3b82f6;">Registration Confirmed!</h1>
  <p>Hi {{playerName}},</p>
  <p>Your registration for <strong>{{eventName}}</strong> has been confirmed.</p>
  <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 0;"><strong>Event:</strong> {{eventName}}</p>
    <p style="margin: 8px 0 0;"><strong>Date:</strong> {{eventDate}}</p>
    <p style="margin: 8px 0 0;"><strong>Location:</strong> {{eventLocation}}</p>
  </div>
</div>`,
    variables: ["playerName", "eventName", "eventDate", "eventLocation", "eventUrl"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

// Sample variables for preview
const sampleVariables: Record<string, Record<string, string>> = {
  welcome: {
    organizationName: "Sports Club",
    playerName: "John Doe",
    loginUrl: "https://example.com/login",
  },
  match_reminder: {
    playerName: "John Doe",
    matchName: "Quarter Finals",
    team1: "Team Alpha",
    team2: "Team Beta",
    matchTime: "2:00 PM",
    courtName: "Court 1",
    matchUrl: "https://example.com/match/123",
  },
  registration_confirm: {
    playerName: "John Doe",
    eventName: "Men's Singles Open",
    eventDate: "March 15, 2024",
    eventLocation: "City Sports Complex",
    eventUrl: "https://example.com/event/456",
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({ subject: "", html: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    textContent: "",
    variables: [] as string[],
  });
  const [newVariable, setNewVariable] = useState("");

  const startEditing = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || "",
      variables: template.variables || [],
    });
  };

  const startCreating = () => {
    setEditingTemplate({} as EmailTemplate);
    setFormData({
      name: "",
      subject: "",
      htmlContent: "",
      textContent: "",
      variables: [],
    });
  };

  const saveTemplate = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 500));

    if (editingTemplate?._id) {
      // Update existing
      setTemplates((prev) =>
        prev.map((t) =>
          t._id === editingTemplate._id
            ? { ...t, ...formData, updatedAt: new Date().toISOString() }
            : t
        )
      );
    } else {
      // Create new
      const newTemplate: EmailTemplate = {
        _id: crypto.randomUUID(),
        templateId: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setTemplates((prev) => [...prev, newTemplate]);
    }

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditingTemplate(null);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.templateId !== templateId));
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      _id: crypto.randomUUID(),
      templateId: crypto.randomUUID(),
      name: `${template.name}_copy`,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const previewTemplate = (template: EmailTemplate) => {
    const sample = sampleVariables[template.name] || {};
    let html = template.htmlContent;
    let subject = template.subject;

    // Replace variables with sample values
    Object.entries(sample).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    setPreviewContent({ subject, html });
    setIsPreviewOpen(true);
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData((prev) => ({
        ...prev,
        variables: [...prev.variables, newVariable],
      }));
      setNewVariable("");
    }
  };

  const removeVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v !== variable),
    }));
  };

  const insertVariable = (variable: string) => {
    const insertion = `{{${variable}}}`;
    setFormData((prev) => ({
      ...prev,
      subject: prev.subject + insertion,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              Email Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize email templates for notifications
            </p>
          </div>
          <Button onClick={startCreating}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </motion.div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {templates.map((template, index) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize">{template.name.replace(/_/g, " ")}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {template.subject}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.variables.length} vars
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Variables */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.variables.slice(0, 4).map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.variables.length - 4} more
                      </Badge>
                    )}
                  </div>

                  {/* Meta */}
                  <p className="text-xs text-muted-foreground mb-4">
                    Updated {formatDate(template.updatedAt || template.createdAt)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewTemplate(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.templateId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {editingTemplate?._id ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Template Name */}
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., welcome, match_reminder"
                className="mt-1"
              />
            </div>

            {/* Subject Line */}
            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject with {{variables}}"
                className="mt-1 font-mono"
              />
            </div>

            {/* Variables Section */}
            <Card className="bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Variable className="w-4 h-4" />
                  Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map((variable) => (
                    <div
                      key={variable}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                    >
                      <span>{variable}</span>
                      <button
                        onClick={() => removeVariable(variable)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => insertVariable(variable)}
                        className="hover:text-foreground"
                        title="Insert into subject"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="Add variable..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addVariable()}
                  />
                  <Button variant="outline" onClick={addVariable}>
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* HTML Content */}
            <div>
              <Label htmlFor="htmlContent" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                HTML Content
              </Label>
              <Textarea
                id="htmlContent"
                value={formData.htmlContent}
                onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                placeholder="HTML email content with {{variables}}"
                className="mt-1 font-mono text-sm min-h-[200px]"
              />
            </div>

            {/* Text Content */}
            <div>
              <Label htmlFor="textContent" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Plain Text Content (Optional)
              </Label>
              <Textarea
                id="textContent"
                value={formData.textContent}
                onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                placeholder="Plain text version for email clients that don't support HTML"
                className="mt-1 font-mono text-sm min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Email Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Subject */}
            <div>
              <Label>Subject</Label>
              <div className="mt-1 p-3 bg-secondary rounded-lg font-medium">
                {previewContent.subject}
              </div>
            </div>

            {/* HTML Preview */}
            <div>
              <Label>Email Body</Label>
              <div 
                className="mt-1 p-4 bg-white rounded-lg border border-border min-h-[300px]"
                dangerouslySetInnerHTML={{ __html: previewContent.html }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
