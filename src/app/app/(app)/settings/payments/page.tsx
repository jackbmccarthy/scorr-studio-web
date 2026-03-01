"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  RotateCcw as RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    onboardingComplete: boolean;
    chargesEnabled: boolean;
  } | null>(null);

  // Check URL params for callback status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setSuccess("Stripe Connect setup complete!");
    }
    if (params.get("error")) {
      setError(params.get("error") || "An error occurred");
    }
    if (params.get("refresh")) {
      setError("Onboarding was interrupted. Please try again.");
    }
  }, []);

  // Fetch Stripe status
  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/stripe/status");
        if (res.ok) {
          const data = await res.json();
          setStripeStatus(data);
        }
      } catch (err) {
        console.error("Failed to fetch Stripe status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Get tenant ID from auth context (mock for now)
      const tenantId = "current_tenant_id"; // TODO: Get from auth

      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to connect Stripe");
      }

      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Failed to connect Stripe account");
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/refresh", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to refresh onboarding link");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Failed to refresh onboarding");
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Payment Settings</h1>
        <p className="text-gray-400">
          Connect your Stripe account to accept payments for competitions and events.
        </p>
      </motion.div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="text-green-400">{success}</span>
        </div>
      )}

      {/* Stripe Connect Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-[#141414] border-gray-800">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"
                        fill="#635BFF"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-1">Stripe Connect</h2>
                    <p className="text-gray-400 text-sm">
                      Accept payments directly to your bank account. We handle the processing,
                      you get paid automatically.
                    </p>
                  </div>
                </div>

                {/* Status */}
                {stripeStatus?.connected ? (
                  <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400">Account Status</span>
                      {stripeStatus.chargesEnabled ? (
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Platform Fee</span>
                      <span className="text-white">5% per transaction</span>
                    </div>
                  </div>
                ) : null}

                {/* Features */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Instant Payments</p>
                      <p className="text-gray-500 text-xs">Accept cards worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Automatic Payouts</p>
                      <p className="text-gray-500 text-xs">Funds go to your bank</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">5% Platform Fee</p>
                      <p className="text-gray-500 text-xs">Simple, transparent pricing</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!stripeStatus?.connected ? (
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="flex-1 bg-[#635BFF] hover:bg-[#7A73FF] text-white"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect with Stripe
                        </>
                      )}
                    </Button>
                  ) : !stripeStatus.chargesEnabled ? (
                    <Button
                      onClick={handleRefresh}
                      disabled={isConnecting}
                      variant="outline"
                      className="flex-1 border-gray-700"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Complete Setup
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRefresh}
                      disabled={isConnecting}
                      variant="outline"
                      className="flex-1 border-gray-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage Stripe Account
                    </Button>
                  )}
                </div>

                {/* Help Text */}
                {stripeStatus?.connected && !stripeStatus.chargesEnabled && (
                  <p className="text-gray-500 text-sm mt-4">
                    Your Stripe account is connected but still being verified.
                    This usually takes 1-2 business days.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-[#141414] border-gray-800">
            <CardContent className="p-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 font-bold">
                1
              </div>
              <h3 className="text-white font-medium mb-1">Connect Stripe</h3>
              <p className="text-gray-400 text-sm">
                Link your bank account through Stripe's secure onboarding process.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-gray-800">
            <CardContent className="p-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-3 font-bold">
                2
              </div>
              <h3 className="text-white font-medium mb-1">Accept Payments</h3>
              <p className="text-gray-400 text-sm">
                Players register and pay online. We handle the transaction processing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-gray-800">
            <CardContent className="p-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 font-bold">
                3
              </div>
              <h3 className="text-white font-medium mb-1">Get Paid</h3>
              <p className="text-gray-400 text-sm">
                Funds are automatically transferred to your bank account (minus 5% fee).
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
