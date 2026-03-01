"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // Verify the session with our backend
      fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus("success");
            setRegistrationId(data.registrationId);
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    } else {
      setStatus("success");
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="bg-[#141414] border-gray-800 text-center">
          <CardContent className="p-8">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
                <p className="text-gray-400">Please wait while we confirm your registration...</p>
              </>
            )}

            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">Registration Complete!</h2>
                <p className="text-gray-400 mb-6">
                  You've been successfully registered. Check your email for confirmation details.
                </p>

                {registrationId && (
                  <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-500 mb-1">Confirmation Number</p>
                    <p className="text-lg font-mono text-white">{registrationId}</p>
                  </div>
                )}

                <Link href="/">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h2>
                <p className="text-gray-400 mb-6">
                  We couldn't verify your payment. Please contact support if you were charged.
                </p>

                <Link href="/">
                  <Button variant="outline" className="w-full border-gray-700">
                    Go Home
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
