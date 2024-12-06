import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navbar from "../components/navbar";
import { useSession } from "@/context/SessionContext";
import { fetchWithErrorHandling } from "@/utils/api-error";
import { format } from 'date-fns';

interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  client: {
    name: string;
  };
  supplier: {
    name: string;
  };
  createdAt: string;
}

export default function Invoices() {
  const { session, loading: sessionLoading } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Sort by date
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
                        {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.supplier.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
