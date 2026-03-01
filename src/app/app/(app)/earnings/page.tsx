"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CreditCard,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface EarningsSummary {
  totalRevenue: number;
  totalPlatformFees: number;
  totalOrganizerAmount: number;
  pendingPayouts: number;
  paidOut: number;
  transactionCount: number;
  refundedAmount: number;
  transactions: any[];
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch("/api/earnings");
        if (!res.ok) throw new Error("Failed to fetch earnings");
        const data = await res.json();
        setEarnings(data);
      } catch (err: any) {
        setError(err.message || "Failed to load earnings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const exportCSV = () => {
    if (!earnings?.transactions) return;

    const headers = [
      "Date",
      "Transaction ID",
      "Description",
      "Payer",
      "Amount",
      "Platform Fee",
      "Your Earnings",
      "Status",
    ];

    const rows = earnings.transactions.map((tx: any) => [
      format(new Date(tx.createdAt), "yyyy-MM-dd"),
      tx.transactionId,
      tx.description || "Event Registration",
      tx.payerName || tx.payerEmail || "N/A",
      formatCurrency(tx.amount),
      formatCurrency(tx.platformFee),
      formatCurrency(tx.organizerAmount),
      tx.status,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(earnings?.totalRevenue || 0),
      change: earnings?.transactionCount || 0,
      changeLabel: "transactions",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      label: "Your Earnings",
      value: formatCurrency(earnings?.totalOrganizerAmount || 0),
      change: null,
      changeLabel: "after fees",
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Pending Payout",
      value: formatCurrency(earnings?.pendingPayouts || 0),
      change: null,
      changeLabel: "processing",
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      label: "Paid Out",
      value: formatCurrency(earnings?.paidOut || 0),
      change: null,
      changeLabel: "total transferred",
      icon: CreditCard,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Earnings Dashboard</h1>
          <p className="text-gray-400">
            Track your revenue from competition registrations
          </p>
        </div>
        <Button
          onClick={exportCSV}
          variant="outline"
          className="border-gray-700"
          disabled={!earnings?.transactions?.length}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-[#141414] border-gray-800 h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  {stat.change !== null && (
                    <Badge variant="outline" className="border-gray-700 text-gray-400">
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Platform Fee Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Platform Fee: 5%</p>
              <p className="text-blue-300/80 text-sm">
                A 5% fee is deducted from each transaction to cover payment processing and platform costs.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-[#141414] border-gray-800">
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            </div>

            {earnings?.transactions?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Date</th>
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Description</th>
                      <th className="text-left text-gray-400 text-sm font-medium p-4">Payer</th>
                      <th className="text-right text-gray-400 text-sm font-medium p-4">Amount</th>
                      <th className="text-right text-gray-400 text-sm font-medium p-4">Fee</th>
                      <th className="text-right text-gray-400 text-sm font-medium p-4">Earnings</th>
                      <th className="text-center text-gray-400 text-sm font-medium p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.transactions.map((tx: any) => (
                      <tr key={tx.transactionId} className="border-b border-gray-800 hover:bg-[#0a0a0a]">
                        <td className="p-4 text-gray-300 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {format(new Date(tx.createdAt), "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="p-4 text-white text-sm">{tx.description || "Event Registration"}</td>
                        <td className="p-4 text-gray-300 text-sm">{tx.payerName || tx.payerEmail || "—"}</td>
                        <td className="p-4 text-right text-white font-medium">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="p-4 text-right text-gray-500">
                          -{formatCurrency(tx.platformFee)}
                        </td>
                        <td className="p-4 text-right text-green-400 font-medium">
                          {formatCurrency(tx.organizerAmount)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            className={
                              tx.status === "succeeded"
                                ? "bg-green-500/20 text-green-400 border-0"
                                : tx.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border-0"
                                : "bg-gray-500/20 text-gray-400 border-0"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Transactions will appear here when players register for your events
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payout Schedule Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>Payouts are processed automatically by Stripe.</p>
        <p>
          Funds typically arrive in your bank account within 2-7 business days.
        </p>
      </motion.div>
    </div>
  );
}
