import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import Navbar from "../components/navbar";
import { useSession } from "@/context/SessionContext";
import { fetchWithErrorHandling } from "@/utils/api-error";
import { ErrorBoundary } from 'react-error-boundary';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { IndianRupee, TrendingUp, Users, FileText, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InvoiceComponent from '../components/InvoiceComponent';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import SupplierInvoiceView from "../components/SupplierInvoiceView";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import { useRouter } from 'next/router';

const MONTH_COLORS = [
  'rgba(147, 51, 234, 0.8)',  // Purple
  'rgba(59, 130, 246, 0.8)',  // Blue
  'rgba(16, 185, 129, 0.8)',  // Green
  'rgba(245, 158, 11, 0.8)',  // Amber
  'rgba(239, 68, 68, 0.8)',   // Red
  'rgba(14, 165, 233, 0.8)',  // Sky
  'rgba(99, 102, 241, 0.8)',  // Indigo
  'rgba(236, 72, 153, 0.8)',  // Pink
  'rgba(168, 85, 247, 0.8)',  // Purple
  'rgba(34, 197, 94, 0.8)',   // Green
  'rgba(234, 179, 8, 0.8)',   // Yellow
  'rgba(249, 115, 22, 0.8)'   // Orange
];

const DEFAULT_COLOR = 'rgba(14, 165, 233, 1)'; // Sky blue

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
    address?: string;
    gstin?: string;
  };
  supplier: {
    name: string;
    email: string;
    address?: string;
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

interface Supplier {
  _id: string;
  name: string;
  email: string;
  address?: string;
  rate: number;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

interface SupplierData {
  name: string;
  total: number;
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="text-red-500 p-4">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export default function Dashboard() {
  const { session, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<{ name: string; total: number; }[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierColors, setSupplierColors] = useState<Record<string, string>>({});
  const [supplierMonthlyData, setSupplierMonthlyData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  }>({ labels: [], datasets: [] });
  const [totalSupplierData, setTotalSupplierData] = useState<{
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
  }>({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await fetchWithErrorHandling<Supplier[]>('/api/suppliers');
        setSuppliers(data);
        
        // Generate color mapping for suppliers
        const colors: Record<string, string> = {};
        data.forEach((supplier, index) => {
          colors[supplier.name] = MONTH_COLORS[index % MONTH_COLORS.length].replace('0.8', '1');
        });
        colors['Default'] = DEFAULT_COLOR;
        setSupplierColors(colors);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (!sessionLoading) {
      fetchSuppliers();
    }
  }, [sessionLoading]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        if (!session?.email) {
          setError('Session expired. Please login again.');
          setLoading(false);
          return;
        }

        console.log('Fetching invoices for email:', session.email);

        const currentDate = selectedDate || new Date();
        const startDate = startOfMonth(currentDate);
        const endDate = endOfMonth(currentDate);

        const data = await fetchWithErrorHandling<Invoice[]>(
          `/api/invoices?email=${encodeURIComponent(session.email)}`
        );

        setData(data);

        // Sort and filter invoices for the selected month
        const filteredInvoices = data.filter(invoice => {
          const invoiceDate = new Date(invoice.invoiceDate);
          return invoiceDate >= startDate && invoiceDate <= endDate;
        });

        // Get total invoice count for the month
        const totalMonthlyInvoices = filteredInvoices.length;

        // Sort by date and limit to 6 most recent
        const sortedInvoices = filteredInvoices
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);

        setRecentInvoices(sortedInvoices);

        // Process monthly data
        const monthlyTotals = data.reduce((acc, invoice) => {
          const date = new Date(invoice.invoiceDate);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          acc[monthYear] = (acc[monthYear] || 0) + invoice.amount;
          return acc;
        }, {} as Record<string, number>);

        const monthlyDataArray = Object.entries(monthlyTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => {
            const [monthA, yearA] = a.name.split(' ');
            const [monthB, yearB] = b.name.split(' ');
            return new Date(`${monthA} ${yearA}`).getTime() - new Date(`${monthB} ${yearB}`).getTime();
          })
          .slice(-12);

        setMonthlyData(monthlyDataArray);

        // Process supplier data for the selected month
        const supplierTotals = filteredInvoices.reduce((acc, invoice) => {
          const supplierName = invoice.supplier.name;
          acc[supplierName] = (acc[supplierName] || 0) + invoice.amount;
          return acc;
        }, {} as Record<string, number>);

        const supplierDataArray = Object.entries(supplierTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total);

        setSupplierData(supplierDataArray);

        // Process supplier monthly data
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = subMonths(new Date(), i);
          return format(date, 'MMM yyyy');
        }).reverse();

        const supplierMonthlyTotals: Record<string, Record<string, number>> = {};

        data.forEach(invoice => {
          const monthYear = format(new Date(invoice.invoiceDate), 'MMM yyyy');
          if (last6Months.includes(monthYear)) {
            const supplierName = invoice.supplier.name;
            if (!supplierMonthlyTotals[supplierName]) {
              supplierMonthlyTotals[supplierName] = {};
            }
            if (!supplierMonthlyTotals[supplierName][monthYear]) {
              supplierMonthlyTotals[supplierName][monthYear] = 0;
            }
            supplierMonthlyTotals[supplierName][monthYear] += invoice.amount;
          }
        });

        const monthLabels = last6Months;
        const datasets = Object.entries(supplierMonthlyTotals).map(([supplier, monthlyData]) => ({
          label: supplier,
          data: monthLabels.map(month => monthlyData[month] || 0),
          backgroundColor: supplierColors[supplier] || supplierColors['Default'],
        }));

        setSupplierMonthlyData({
          labels: monthLabels,
          datasets,
        });

        // Process supplier monthly trends data
        const supplierMonthlyTrendsData = {
          labels: last6Months,
          datasets: Object.entries(supplierMonthlyTotals).map(([supplier, monthlyData], index) => ({
            label: supplier,
            data: last6Months.map(month => monthlyData[month] || 0),
            backgroundColor: supplierColors[supplier] || supplierColors['Default'],
          })),
        };

        // Process total supplier data for pie chart
        const totalSupplierTotals = data.reduce((acc, invoice) => {
          const supplierName = invoice.supplier.name;
          acc[supplierName] = (acc[supplierName] || 0) + invoice.amount;
          return acc;
        }, {} as Record<string, number>);

        const sortedSuppliers = Object.entries(totalSupplierTotals)
          .sort((a, b) => b[1] - a[1]);

        setTotalSupplierData({
          labels: sortedSuppliers.map(([name]) => name),
          datasets: [{
            data: sortedSuppliers.map(([_, total]) => total),
            backgroundColor: sortedSuppliers.map(([name]) => 
              supplierColors[name] || supplierColors['Default']
            ),
          }]
        });

        // Set state
        // setSupplierMonthlyData(supplierMonthlyData);
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
  }, [session?.email, sessionLoading, selectedDate, supplierColors]);

  if (sessionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="w-48">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date || new Date())}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{monthlyData.reduce((sum, month) => sum + month.total, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  For all time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{supplierData.reduce((sum, supplier) => sum + supplier.total, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(selectedDate || new Date(), 'MMMM yyyy')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {supplierData.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentInvoices.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>Revenue trends over months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: monthlyData.map(d => d.name),
                      datasets: [{
                        label: 'Revenue',
                        data: monthlyData.map(d => d.total),
                        borderColor: MONTH_COLORS.map(color => color.replace('0.8', '1')),
                        backgroundColor: MONTH_COLORS,
                        segment: {
                          borderColor: (ctx) => {
                            if (!ctx.p0.skip && !ctx.p1.skip) {
                              return MONTH_COLORS[ctx.p0DataIndex % MONTH_COLORS.length];
                            }
                          }
                        },
                        pointBackgroundColor: (context) => {
                          const index = context.dataIndex;
                          return MONTH_COLORS[index % MONTH_COLORS.length];
                        },
                        tension: 0.1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `₹${Number(value).toLocaleString()}`
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.raw as number;
                              return `Revenue: ₹${value.toLocaleString()}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Supplier Overview</CardTitle>
                <CardDescription>Revenue by supplier for {format(selectedDate || new Date(), 'MMMM yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading data...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : supplierData.length === 0 ? (
                  <div>No data for selected month</div>
                ) : (
                  <div className="h-[300px]">
                    <Bar
                      data={{
                        labels: supplierData.map(d => d.name),
                        datasets: [{
                          data: supplierData.map(d => d.total),
                          backgroundColor: supplierData.map(supplier => 
                            supplierColors[supplier.name] || supplierColors['Default']
                          ),
                          borderColor: supplierData.map(supplier => 
                            supplierColors[supplier.name] || supplierColors['Default']
                          ),
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        indexAxis: 'y' as const,
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `₹${Number(value).toLocaleString()}`
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `Revenue: ₹${value.toLocaleString()}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <SupplierInvoiceView 
            invoices={data} 
            supplierColors={supplierColors}
          />

          <Card>
            <CardHeader>
              <CardTitle>Total Supplier Revenue</CardTitle>
              <CardDescription>Total revenue by supplier</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading data...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : totalSupplierData.labels.length === 0 ? (
                <div>No data available</div>
              ) : (
                <div className="h-[400px]">
                  <Pie
                    data={totalSupplierData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right' as const,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.raw as number;
                              const label = totalSupplierData.labels[context.dataIndex];
                              return `${label}: ₹${value.toLocaleString()}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Recent Invoices</CardTitle>
              <button
                onClick={() => router.push('/invoices')}
                className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
              >
                See All
              </button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading invoices...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : recentInvoices.length === 0 ? (
                <div>No invoices found for selected month</div>
              ) : (
                <div className="space-y-8">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.invoiceNumber} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {invoice.client.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.supplier.name}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        ₹{invoice.amount.toLocaleString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-4"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </ErrorBoundary>

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
                  address: {
                    street: selectedInvoice.supplier.address || '',
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
                  address: {
                    street: selectedInvoice.client.address || '',
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
