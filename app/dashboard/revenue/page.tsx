"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard } from "lucide-react";
import { BankDetailsDialog } from "@/components/bank-details-dialog";
import { getEducatorPayments, getEducatorPayouts } from "@/util/server";
import { useToast } from "@/hooks/use-toast";

const formatINR = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    succeeded: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-slate-100 text-slate-800";
};

export default function RevenuePage() {
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
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      totalRevenue,
      totalPayouts,
      transactions: payments.length,
    };
  }, [payments, payouts]);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Revenue">
        <BankDetailsDialog />
      </DashboardHeader>
      <div className="flex-1 p-6 space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Total Revenue",
              value: formatINR(totals.totalRevenue),
              icon: DollarSign,
            },
            {
              title: "Total Payouts",
              value: formatINR(totals.totalPayouts),
              icon: DollarSign,
            },
            {
              title: "Transactions",
              value: totals.transactions.toString(),
              icon: CreditCard,
            },
          ].map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-slate-100">
                  <stat.icon className="h-4 w-4 text-slate-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
