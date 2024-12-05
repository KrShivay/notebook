import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { numberToWords } from '../utils/number-to-words';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supplierData } from '../data/supplier';
import { clientData } from '../data/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useInvoice } from '../context/InvoiceContext';
import Navbar from '../components/navbar';

const formSchema = z.object({
  supplier: z.string(),
  invoiceDate: z.date(),
  client: z.string(),
  monthYear: z.date(),
  days: z.string()
});

const generateInvoiceNumber = (supplier: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dayOfYear = String(Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000)).padStart(3, '0');
  const base = year.toString();
  
  switch(supplier) {
    case 'joel':
      return base + Math.floor(Math.random() * 90) + dayOfYear + hours + minutes;
    case 'neetu':
      return '24' + dayOfYear + Math.floor(Math.random() * 90) + hours + minutes + Math.floor(Math.random() * 900);
    case 'shubhlika':
      return '17' + hours + minutes + Math.floor(Math.random() * 90) + dayOfYear +  Math.floor(Math.random() * 9000);
    default:
      return base + hours + minutes;
  }
};

type FormValues = {
  supplier: keyof typeof supplierData;
  invoiceDate: Date;
  client: keyof typeof clientData;
  monthYear: Date;
  days: string;
};

const GenerateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier: undefined,
      invoiceDate: undefined,
      client: undefined,
      monthYear: undefined,
      days: undefined,
    }
  });
  const router = useRouter();
  const { setInvoiceData } = useInvoice();

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const supplier = supplierData[data.supplier];
      const client = clientData[data.client];
      const amount = parseInt(data.days) * supplier.rate;
      
      const monthYear = new Date(data.monthYear);
      const invoiceData = {
        invoiceNumber: generateInvoiceNumber(data.supplier),
        invoiceDate: format(data.invoiceDate, 'dd MMM yyyy'),
        startDate: format(startOfMonth(monthYear), 'dd MMM yyyy'),
        endDate: format(endOfMonth(monthYear), 'dd MMM yyyy'),
        days: parseInt(data.days),
        amount: amount,
        amountInWords: numberToWords(amount),
        supplier: supplier,
        client: client
      };

      setInvoiceData(invoiceData);
      router.push('/invoice-component');
      setLoading(false);
    } catch (error) {
      console.error('Error generating invoice:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Generate Invoice</h1>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <SelectItem value="joel">Joel James</SelectItem>
                      <SelectItem value="neetu">Neetu Balyan</SelectItem>
                      <SelectItem value="shubhlika">Shubhlika Srivastava</SelectItem>
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
                <FormItem className="flex flex-col">
                  <FormLabel>Invoice Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                      <SelectItem value="scorich">Scorich Services Pvt. Ltd.</SelectItem>
                      <SelectItem value="yoomoney">Yoomoney Fintech Services</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthYear"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Month and Year</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMMM yyyy")
                          ) : (
                            <span>Pick a month</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Days</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Invoice"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default GenerateInvoice;
