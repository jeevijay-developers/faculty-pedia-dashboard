/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, IndianRupee, Building2 } from "lucide-react";
import { BankDetailsDialog } from "@/components/bank-details-dialog";
import {
  RecordCard,
  RecordCardEmpty,
  RecordCardList,
  RecordCardSkeleton,
} from "@/components/mobile/record-card";
import { getEducatorPayments, getEducatorPayouts } from "@/util/server";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

const formatINR = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    succeeded: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    processed: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-slate-100 text-slate-800";
};

export default function RevenuePage() {
  const { educator } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [payRes, payoutRes] = await Promise.all([
          getEducatorPayments({ limit: 5 }),
          getEducatorPayouts({ limit: 5 }),
        ]);
        setPayments(payRes?.data?.payments || []);
        setPayouts(payoutRes?.data?.payouts || []);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error",
          description: "Unable to load revenue data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const totals = useMemo(() => {
    const successfulPayments = payments.filter((p) => p.status === "succeeded");
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      totalRevenue,
      totalPayouts,
      transactions: successfulPayments.length,
    };
  }, [payments, payouts]);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Revenue">
        <BankDetailsDialog />
      </DashboardHeader>
      <div className="flex-1 p-4 space-y-4 md:p-6 md:space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {[
            {
              title: "Total Revenue",
              value: formatINR(totals.totalRevenue),
              icon: IndianRupee,
            },
            {
              title: "Total Payouts",
              value: formatINR(totals.totalPayouts),
              icon: IndianRupee,
            },
            {
              title: "Transactions",
              value: totals.transactions.toString(),
              icon: CreditCard,
            },
            {
              title: "Payout Status",
              value: (educator as any)?.razorpayFundAccountId
                ? "Verified ✓"
                : "Pending",
              desc: (educator as any)?.razorpayFundAccountId
                ? `${
                    (educator as any)?.bankDetails?.bankName || "Bank"
                  } - XXXX${
                    (educator as any)?.bankDetails?.accountNumber?.slice(-4) ||
                    "XXXX"
                  }`
                : "Setup bank details",
              icon: Building2,
              className: (educator as any)?.razorpayFundAccountId
                ? "text-green-600"
                : "text-amber-600",
              bgClassName: (educator as any)?.razorpayFundAccountId
                ? "bg-green-100"
                : "bg-amber-100",
            },
          ].map((stat: any) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 md:px-6">
                <CardTitle className="text-sm font-medium min-w-0">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    stat.bgClassName || "bg-slate-100"
                  }`}
                >
                  <stat.icon
                    className={`h-4 w-4 ${stat.className || "text-slate-700"}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                <div
                  className={`text-xl font-bold break-words md:text-2xl ${
                    stat.className || ""
                  }`}
                >
                  {stat.value}
                </div>
                {stat.desc && (
                  <p className="text-xs text-muted-foreground mt-1 break-words">
                    {stat.desc}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            {/* Mobile: stacked records instead of a horizontally scrolling table */}
            <div className="md:hidden">
              {loading && payments.length === 0 ? (
                <RecordCardSkeleton rows={3} />
              ) : payments.length === 0 ? (
                <RecordCardList>
                  <RecordCardEmpty message="No transactions yet" />
                </RecordCardList>
              ) : (
                <RecordCardList>
                  {payments.map((p) => (
                    <RecordCard
                      key={p._id}
                      title={p.productSnapshot?.title || "N/A"}
                      badge={
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      }
                      meta={[
                        <span
                          key="amount"
                          className="font-medium text-foreground"
                        >
                          {formatINR(p.amount || 0)}
                        </span>,
                        <span key="type" className="capitalize">
                          {p.productType}
                        </span>,
                        p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-",
                      ]}
                    />
                  ))}
                </RecordCardList>
              )}
            </div>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No transactions yet"}
                      </td>
                    </tr>
                  )}
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {p.productSnapshot?.title || "N/A"}
                      </td>
                      <td className="py-3 px-4 capitalize">{p.productType}</td>
                      <td className="py-3 px-4 font-medium">
                        {formatINR(p.amount || 0)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle>Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            {/* Mobile: stacked records instead of a horizontally scrolling table */}
            <div className="md:hidden">
              {loading && payouts.length === 0 ? (
                <RecordCardSkeleton rows={3} />
              ) : payouts.length === 0 ? (
                <RecordCardList>
                  <RecordCardEmpty message="No payouts yet" />
                </RecordCardList>
              ) : (
                <RecordCardList>
                  {payouts.map((p) => (
                    <RecordCard
                      key={p._id}
                      title={`Payout ${p.month}/${p.year}`}
                      badge={
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      }
                      meta={[
                        <span key="net" className="font-medium text-foreground">
                          Net {formatINR(p.amount || 0)}
                        </span>,
                        `Gross ${formatINR(p.grossAmount || 0)}`,
                        `Commission ${formatINR(p.commissionAmount || 0)}`,
                      ]}
                    />
                  ))}
                </RecordCardList>
              )}
            </div>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-left py-3 px-4 font-medium">Gross</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Commission
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Net Payout
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No payouts yet"}
                      </td>
                    </tr>
                  )}
                  {payouts.map((p) => (
                    <tr key={p._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {p.month}/{p.year}
                      </td>
                      <td className="py-3 px-4">
                        {formatINR(p.grossAmount || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {formatINR(p.commissionAmount || 0)}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatINR(p.amount || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
