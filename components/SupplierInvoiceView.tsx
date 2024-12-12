import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PopulatedInvoice } from '@/types/models';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  invoices: PopulatedInvoice[];
  supplierColors: Record<string, string>;
}

export default function SupplierInvoiceView({ invoices, supplierColors }: Props) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  }>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (!invoices?.length) return;

    // Group invoices by supplier and month
    const supplierMonthlyData: Record<string, Record<string, number>> = {};
    
    invoices.forEach(invoice => {
      const month = new Date(invoice.dueDate).toLocaleString('default', { month: 'long' });
      const supplierName = invoice.supplier.name;
      
      if (!supplierMonthlyData[supplierName]) {
        supplierMonthlyData[supplierName] = {};
      }
      if (!supplierMonthlyData[supplierName][month]) {
        supplierMonthlyData[supplierName][month] = 0;
      }
      supplierMonthlyData[supplierName][month] += invoice.total;
    });

    // Get unique months and sort them
    const monthsArray = invoices.map(invoice => 
      new Date(invoice.dueDate).toLocaleString('default', { month: 'long' })
    );
    const uniqueMonths = Array.from(new Set(monthsArray));
    const months = uniqueMonths.sort((a, b) => {
      const monthOrder = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    // Create datasets for each supplier
    const datasets = Object.entries(supplierMonthlyData).map(([supplier, monthlyData]) => ({
      label: supplier,
      data: months.map(month => monthlyData[month] || 0),
      backgroundColor: supplierColors[supplier] || supplierColors.Default
    }));

    setChartData({
      labels: months,
      datasets
    });
  }, [invoices, supplierColors]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Invoice Distribution by Supplier',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              return `₹${value.toLocaleString()}`;
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-[400px] p-4">
      {chartData.labels.length > 0 ? (
        <Bar options={options} data={chartData} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No invoice data available</p>
        </div>
      )}
    </div>
  );
}
