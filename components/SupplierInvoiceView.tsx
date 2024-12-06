import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';

interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  supplier: {
    name: string;
  };
}

interface SupplierInvoiceViewProps {
  invoices: Invoice[];
  supplierColors: { [key: string]: string };
}

interface SupplierData {
  [supplier: string]: {
    [month: string]: number;
  };
}

export default function SupplierInvoiceView({ invoices, supplierColors }: SupplierInvoiceViewProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierData>({});

  // Get unique months and suppliers
  const allMonths = Array.from(new Set(invoices.map(invoice => 
    format(new Date(invoice.invoiceDate), 'MMM yyyy')
  ))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const allSuppliers = Array.from(new Set(invoices.map(invoice => invoice.supplier.name)));

  useEffect(() => {
    // Process invoice data
    const data: SupplierData = {};
    invoices.forEach(invoice => {
      const month = format(new Date(invoice.invoiceDate), 'MMM yyyy');
      const supplier = invoice.supplier.name;
      
      if (!data[supplier]) {
        data[supplier] = {};
      }
      if (!data[supplier][month]) {
        data[supplier][month] = 0;
      }
      data[supplier][month] += invoice.amount;
    });
    setSupplierData(data);

    // Initialize with all months and suppliers selected
    setSelectedMonths(allMonths);
    setSelectedSuppliers(allSuppliers);
  }, [invoices]);

  const chartData = {
    labels: selectedMonths,
    datasets: selectedSuppliers.map(supplier => {
      const color = supplierColors[supplier] || supplierColors['Default'];
      return {
        label: supplier,
        data: selectedMonths.map(month => supplierData[supplier]?.[month] || 0),
        borderColor: color,
        backgroundColor: color.replace('1)', '0.2)'),
        borderWidth: 2,
        fill: true,
        tension: 0.1
      };
    })
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `₹${value.toLocaleString()}`
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            return `${context.dataset.label}: ₹${value.toLocaleString()}`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return (
    <Card className="col-span-7">
      <CardHeader>
        <CardTitle>Supplier Invoice Analysis</CardTitle>
        <CardDescription>Compare invoice data across suppliers and months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm font-medium mb-2">Select Months</div>
            <div className="grid grid-cols-3 gap-2">
              {allMonths.map(month => (
                <div key={month} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`month-${month}`}
                    checked={selectedMonths.includes(month)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMonths([...selectedMonths, month].sort(
                          (a, b) => new Date(a).getTime() - new Date(b).getTime()
                        ));
                      } else {
                        setSelectedMonths(selectedMonths.filter(m => m !== month));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`month-${month}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {month}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Select Suppliers</div>
            <div className="grid grid-cols-2 gap-2">
              {allSuppliers.map(supplier => (
                <div key={supplier} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`supplier-${supplier}`}
                    checked={selectedSuppliers.includes(supplier)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSuppliers([...selectedSuppliers, supplier]);
                      } else {
                        setSelectedSuppliers(selectedSuppliers.filter(s => s !== supplier));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    style={{
                      accentColor: supplierColors[supplier] || supplierColors['Default']
                    }}
                  />
                  <label
                    htmlFor={`supplier-${supplier}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {supplier}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-[400px]">
          {selectedMonths.length > 0 && selectedSuppliers.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Please select at least one month and supplier to view data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
