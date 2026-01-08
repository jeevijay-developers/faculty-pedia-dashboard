"use client";

import { useState } from "react";
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
import { Loader2, Building2 } from "lucide-react";

interface BankDetailsDialogProps {
  trigger?: React.ReactNode;
}

export function BankDetailsDialog({ trigger }: BankDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { educator } = useAuth();

  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educator?._id) return;

    setLoading(true);
    try {
      await updateBankDetails(educator._id, formData);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Building2 className="h-4 w-4" />
            Update Bank Details
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
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={handleChange}
              required
            />
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
