import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { numberToWords } from '../utils/number-to-words';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useData } from '@/context/DataContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { useRouter } from 'next/router';
import { useInvoice } from '../context/InvoiceContext';
import { useSession } from '@/context/SessionContext';
import { useForm as useFormContext } from "@/context/FormContext";
import Navbar from '../components/navbar';
import { toast } from 'react-toastify';

const formSchema = z.object({
  supplier: z.string(),
  invoiceDate: z.date().optional(),
  client: z.string(),
  monthYear: z.date().optional(),
  days: z.string()
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 31, {
      message: "Days must be between 1 and 31"
    })
});

type FormValues = {
  supplier: string;
  invoiceDate?: Date;
  client: string;
  monthYear?: Date;
  days: string;
};

const generateInvoiceNumber = (supplier: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const supplierPrefix = supplier.substring(0, 2).toUpperCase();
  return `${supplierPrefix}${year}${month}${day}${hours}${minutes}${seconds}`;
};

const GenerateInvoice = () => {
  const { formData, updateFormData, resetFormData } = useFormContext();
  const { suppliers, clients, loading: dataLoading, error: dataError } = useData();
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const router = useRouter();
  const { setInvoiceData } = useInvoice();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: formData.supplier || "",
      client: formData.client || "",
      invoiceDate: formData.invoiceDate || undefined,
      monthYear: formData.monthYear || undefined,
      days: formData.days || "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session?.email) {
        toast.error('Session expired. Please login again.');
        return;
      }

      setLoading(true);
      const supplier = suppliers.find(s => s._id === values.supplier);
      const client = clients.find(c => c._id === values.client);
      
      if (!supplier || !client) {
        toast.error('Invalid supplier or client selected');
        return;
      }

      if (!values.monthYear || !values.invoiceDate) {
        toast.error('Please select both month and invoice date');
        return;
      }

      const amount = parseInt(values.days) * supplier.rate;
      
      const monthYear = values.monthYear;
      const invoiceData = {
        invoiceNumber: generateInvoiceNumber(values.supplier),
        invoiceDate: format(values.invoiceDate, 'dd MMM yyyy'),
        startDate: format(startOfMonth(monthYear), 'dd MMM yyyy'),
        endDate: format(endOfMonth(monthYear), 'dd MMM yyyy'),
        days: parseInt(values.days),
        amount: amount,
        amountInWords: `₹${numberToWords(amount)} only`,
        supplier: supplier,
        client: client,
        userEmail: session.email
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      setInvoiceData(invoiceData);
      toast.success('Invoice generated successfully');
      router.push('/invoice-component');
      resetFormData();
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading suppliers and clients...</div>;
  }

  if (dataError) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{dataError}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier._id!}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client._id!}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date || undefined)}
                          dateFormat="dd/MM/yyyy"
                          showYearDropdown
                          showMonthDropdown
                          maxDate={new Date()}
                          placeholderText="Select invoice date"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month and Year</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date || undefined)}
                          dateFormat="MMMM yyyy"
                          showMonthYearPicker
                          maxDate={new Date()}
                          placeholderText="Select month and year"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Number of Days</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="31" 
                        {...field}
                        className="w-full"
                        placeholder="Enter number of days (1-31)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Invoice'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default GenerateInvoice;
