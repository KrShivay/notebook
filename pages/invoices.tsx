import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navbar from "../components/navbar";
import { useSession } from "@/context/SessionContext";
import { fetchWithErrorHandling } from "@/utils/api-error";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InvoiceComponent from '../components/InvoiceComponent';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  startDate: string;
  endDate: string;
  days: number;
  amount: number;
  amountInWords: string;
  client: {
    name: string;
    email: string;
    address: {
                    street:  string,
                    city: string,
                    state: string,
                    pincode: string
                  };
    gstin?: string;
  };
  supplier: {
    name: string;
    email: string;
    address: {
                    street:  string,
                    city: string,
                    state: string,
                    pincode: string
                  };
    rate: number;
    pan?: string;
    bankDetails?: {
      accountName?: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      branch?: string;
    };
  };
  createdAt: string;
}

export default function Invoices() {
  const { session, loading: sessionLoading } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        if (!session?.email) {
          setError('Session expired. Please login again.');
          setLoading(false);
          return;
        }

        const data = await fetchWithErrorHandling<Invoice[]>(
          `/api/invoices?email=${encodeURIComponent(session.email)}`
        );

        const sortedInvoices = data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setInvoices(sortedInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    if (!sessionLoading) {
      fetchInvoices();
    }
  }, [session?.email, sessionLoading]);

  if (sessionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Invoices</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading invoices...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-4">No invoices found</div>
            ) : (
              <div className="space-y-8">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.invoiceNumber}
                    className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-6 md:items-center"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {invoice.client.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Invoice #{invoice.invoiceNumber}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">
                        ₹{invoice.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice #{selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="mt-4">
              <InvoiceComponent data={{
                ...selectedInvoice,
                supplier: {
                  ...selectedInvoice.supplier,
                  address: selectedInvoice.supplier.address || {
                    street:  '',
                    city: '',
                    state: '',
                    pincode: ''
                  },
                  pan: selectedInvoice.supplier.pan || '',
                  bankDetails: {
                    accountName: selectedInvoice.supplier.bankDetails?.accountName || selectedInvoice.supplier.name,
                    accountNumber: selectedInvoice.supplier.bankDetails?.accountNumber || '',
                    bankName: selectedInvoice.supplier.bankDetails?.bankName || '',
                    ifscCode: selectedInvoice.supplier.bankDetails?.ifscCode || '',
                    branch: selectedInvoice.supplier.bankDetails?.branch || ''
                  },
                  rate: selectedInvoice.supplier.rate
                },
                client: {
                  ...selectedInvoice.client,
                  address: selectedInvoice.client.address || {
                    street: '',
                    city: '',
                    state: '',
                    pincode: ''
                  },
                  gstin: selectedInvoice.client.gstin || ''
                }
              }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
