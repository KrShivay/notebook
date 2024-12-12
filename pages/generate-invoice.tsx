import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be non-negative'),
  amount: z.number().min(0, 'Amount must be non-negative')
});

const invoiceSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  invoiceDate: z.date().min(new Date(), 'Invoice date must be today or later'),
  client: z.string().min(1, 'Client is required'),
  monthYear: z.date().min(new Date(), 'Month and year must be today or later'),
  days: z.string()
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 31, {
      message: "Days must be between 1 and 31"
    }),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

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

  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [monthYear, setMonthYear] = useState<Date>(new Date());

  const handleInvoiceDateChange = (date: Date | null) => {
    if (date) {
      setInvoiceDate(date);
    }
  };

  const handleMonthYearChange = (date: Date | null) => {
    if (date) {
      setMonthYear(date);
    }
  };

  const methods = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      supplier: formData.supplier || "",
      client: formData.client || "",
      invoiceDate: invoiceDate,
      monthYear: monthYear,
      days: formData.days || "",
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    },
  });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const onSubmit = async (values: InvoiceFormData) => {
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

      const amount = parseInt(values.days) * supplier.rate;
      
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

  const calculateItemAmount = (index: number) => {
    const item = fields[index];
    if (item && item.quantity && item.rate) {
      const amount = item.quantity * item.rate;
      setValue(`items.${index}.amount`, amount);
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
        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
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
                          <SelectItem key={supplier._id!} value={supplier._id!}>
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
                control={control}
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
                          <SelectItem key={client._id!} value={client._id!}>
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
                control={control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DatePicker
                          selected={invoiceDate}
                          onChange={handleInvoiceDateChange}
                          dateFormat="dd/MM/yyyy"
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
                control={control}
                name="monthYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month and Year</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DatePicker
                          selected={monthYear}
                          onChange={handleMonthYearChange}
                          dateFormat="MMMM yyyy"
                          showMonthYearPicker
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
                control={control}
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Invoice Items</h2>
                <button
                  type="button"
                  onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Add Item
                </button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-md">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.description?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      {...register(`items.${index}.quantity`)}
                      type="number"
                      min="1"
                      onChange={(e) => {
                        register(`items.${index}.quantity`).onChange(e);
                        calculateItemAmount(index);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate</label>
                    <input
                      {...register(`items.${index}.rate`)}
                      type="number"
                      min="0"
                      step="0.01"
                      onChange={(e) => {
                        register(`items.${index}.rate`).onChange(e);
                        calculateItemAmount(index);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.items?.[index]?.rate && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.rate?.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        {...register(`items.${index}.amount`)}
                        type="number"
                        readOnly
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-6 p-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
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
