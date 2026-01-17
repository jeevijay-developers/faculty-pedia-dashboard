/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateBankDetails } from "@/util/server";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDIAN_BANKS } from "@/lib/indian-banks";

interface BankDetailsDialogProps {
  trigger?: React.ReactNode;
}

export function BankDetailsDialog({ trigger }: BankDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { educator, refreshEducator } = useAuth();

  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
  });
  const [bankSearchQuery, setBankSearchQuery] = useState("");

  useEffect(() => {
    if (open && educator) {
      const details = (educator as any).bankDetails || {};
      const accountNumber = details.accountNumber || "";
      setFormData({
        accountHolderName: details.accountHolderName || "",
        bankName: details.bankName || "",
        ifscCode: details.ifscCode || "",
        accountNumber: accountNumber,
        confirmAccountNumber: accountNumber,
      });
      setBankSearchQuery(details.bankName || "");
    }
  }, [open, educator]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankSelect = (bankName: string) => {
    setFormData((prev) => ({ ...prev, bankName }));
    setBankSearchQuery(bankName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educator?._id) return;

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast({
        title: "Error",
        description: "Account numbers do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        bankDetails: {
          accountHolderName: formData.accountHolderName,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
        },
      };
      await updateBankDetails(educator._id, payload);
      await refreshEducator();
      toast({
        title: "Success",
        description: "Bank details updated successfully",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update bank details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const bankDetails = (educator as any)?.bankDetails || {};
  const hasAllBankDetails =
    bankDetails.accountHolderName &&
    bankDetails.accountNumber &&
    bankDetails.ifscCode &&
    bankDetails.bankName;
  const isPayoutReady = !!(educator as any)?.razorpayFundAccountId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Building2 className="h-4 w-4" />
            {isPayoutReady ? "Edit Bank Details" : "Setup Bank Details"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bank Details</DialogTitle>
          <DialogDescription>
            Enter your bank account details to receive payouts.
          </DialogDescription>
        </DialogHeader>

        {isPayoutReady ? (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Payout Ready</AlertTitle>
            <AlertDescription>
              Your bank account is connected for payouts.
            </AlertDescription>
          </Alert>
        ) : hasAllBankDetails ? null : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Add bank details to enable payouts.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              name="accountHolderName"
              placeholder="As per bank records"
              value={formData.accountHolderName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select value={formData.bankName} onValueChange={handleBankSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="sticky top-0 bg-white p-2 border-b">
                  <Input
                    placeholder="Search banks..."
                    value={bankSearchQuery}
                    onChange={(e) => setBankSearchQuery(e.target.value)}
                    className="h-8 bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {INDIAN_BANKS.filter((bank) =>
                  bank.toLowerCase().includes(bankSearchQuery.toLowerCase())
                ).map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
                {INDIAN_BANKS.filter((bank) =>
                  bank.toLowerCase().includes(bankSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No banks found.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                type="text"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmAccountNumber">
                Confirm Account Number
              </Label>
              <Input
                id="confirmAccountNumber"
                name="confirmAccountNumber"
                type="text"
                placeholder="Re-enter account number"
                value={formData.confirmAccountNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              name="ifscCode"
              placeholder="e.g. HDFC0001234"
              value={formData.ifscCode}
              onChange={handleChange}
              required
              className="uppercase"
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Details
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
