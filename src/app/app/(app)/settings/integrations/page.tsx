"use client";

import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Clock, Shield } from "lucide-react";
import { useState } from "react";

// Mock data - will be replaced with Convex queries
const mockApiKeys = [
  {
    id: "1",
    name: "Production API Key",
    prefix: "sk_live_abc123",
    createdAt: "2024-01-15T10:00:00Z",
    lastUsed: "2024-02-13T18:00:00Z",
    permissions: ["read", "write"],
  },
  {
    id: "2",
    name: "Development Key",
    prefix: "sk_test_def456",
    createdAt: "2024-02-01T14:00:00Z",
    lastUsed: "2024-02-13T15:30:00Z",
    permissions: ["read"],
  },
  {
    id: "3",
    name: "Display Integration",
    prefix: "sk_live_ghi789",
    createdAt: "2024-02-10T09:00:00Z",
    lastUsed: null,
    permissions: ["read"],
  },
];

export default function IntegrationsSettingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["read"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    // In production, create key via API
    const fakeKey = "sk_live_" + Math.random().toString(36).substr(2, 24);
    setCreatedKey(fakeKey);
    setShowCreateModal(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In production, show toast
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/app/settings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to Settings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Keys & Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Manage API keys for third-party integrations
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400">Security Notice</p>
              <p className="text-sm text-muted-foreground mt-1">
                API keys provide full access to your organization's data. Never share
                your API keys publicly or commit them to version control. If a key is
                compromised, delete it immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockApiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {key.prefix}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {key.permissions.includes("read") && (
                        <Badge variant="outline" className="text-xs">
                          Read
                        </Badge>
                      )}
                      {key.permissions.includes("write") && (
                        <Badge variant="outline" className="text-xs">
                          Write
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {key.lastUsed ? (
                      <span className="text-sm text-muted-foreground">
                        {new Date(key.lastUsed).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(key.prefix)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Webhooks Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Receive real-time notifications when events occur
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No webhooks configured</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.includes("read")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKeyPermissions([...newKeyPermissions, "read"]);
                        } else {
                          setNewKeyPermissions(
                            newKeyPermissions.filter((p) => p !== "read")
                          );
                        }
                      }}
                    />
                    Read
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.includes("write")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKeyPermissions([...newKeyPermissions, "write"]);
                        } else {
                          setNewKeyPermissions(
                            newKeyPermissions.filter((p) => p !== "write")
                          );
                        }
                      }}
                    />
                    Write
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateKey}>Create Key</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Created Key Modal */}
      {createdKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>API Key Created</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400 mb-2">
                  Your API key has been created. Make sure to copy it now - you won't
                  be able to see it again!
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded overflow-x-auto">
                    {createdKey}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(createdKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setCreatedKey(null)}>Done</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
