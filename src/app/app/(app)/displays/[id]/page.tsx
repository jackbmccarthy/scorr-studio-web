"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Select,
  Switch,
} from "@/components/ui";
import { ArrowLeft, Save, Eye, ExternalLink } from "lucide-react";

// Mock data - replace with Convex query
const mockDisplay = {
  id: "1",
  name: "Main Scoreboard",
  type: "standard",
  width: 1920,
  height: 1080,
  theme: "dark",
  showLogo: true,
  showTimer: true,
  assignedStageId: "stage-1",
};

export default function DisplayEditorPage() {
  const params = useParams();
  const displayId = params.id as string;

  const [formData, setFormData] = useState(mockDisplay);
  const [previewUrl, setPreviewUrl] = useState(`/display/${displayId}`);

  const handleSave = async () => {
    // TODO: Save via Convex mutation
    console.log("Saving display:", formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/app/displays">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Display</h1>
            <p className="text-muted-foreground">Configure scoreboard settings</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={previewUrl} target="_blank">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Live View
            </Button>
          </Link>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Display Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <option value="standard">Standard Scoreboard</option>
                <option value="bracket">Bracket Display</option>
                <option value="composite">Composite (Multi-Match)</option>
              </Select>
            </div>

            {/* Resolution */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({ ...formData, width: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => setFormData({ ...formData, theme: value })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="custom">Custom</option>
              </Select>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showLogo">Show Logo</Label>
                <Switch
                  id="showLogo"
                  checked={formData.showLogo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showLogo: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTimer">Show Timer</Label>
                <Switch
                  id="showTimer"
                  checked={formData.showTimer}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showTimer: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border">
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">Preview</p>
                  <p className="text-sm">Scoreboard preview will appear here</p>
                  <Link href={previewUrl} target="_blank" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      Open Full Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
