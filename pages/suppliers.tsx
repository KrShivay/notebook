import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import { fetchWithErrorHandling } from '@/utils/api-error';

const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  rate: z.string().transform((val) => Number(val)),
  bankDetails: z.object({
    accountNumber: z.string().min(8, 'Account number must be at least 8 characters'),
    ifscCode: z.string().min(11, 'IFSC code must be 11 characters').max(11),
    bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
  }),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface Supplier extends Omit<SupplierFormData, 'rate'> {
  _id: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      rate: '',
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      },
    },
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const data = await fetchWithErrorHandling<Supplier[]>(`/api/suppliers?showInactive=${showInactive}`);
        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch suppliers');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [showInactive]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      setLoading(true);
      const response = await fetchWithErrorHandling<Supplier>('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      toast.success('Supplier added successfully!');
      form.reset();
      
      // Refresh suppliers list
      const updatedSuppliers = await fetchWithErrorHandling<Supplier[]>(`/api/suppliers?showInactive=${showInactive}`);
      setSuppliers(updatedSuppliers);
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      await fetchWithErrorHandling('/api/suppliers', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      // Refresh the list
      const data = await fetchWithErrorHandling<Supplier[]>(`/api/suppliers?showInactive=${showInactive}`);
      setSuppliers(data);
      toast.success(`Supplier marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating supplier status:', error);
      toast.error('Failed to update supplier status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      await fetchWithErrorHandling(`/api/suppliers?id=${id}`, {
        method: 'DELETE',
      });
      
      // Refresh the list
      const data = await fetchWithErrorHandling<Supplier[]>(`/api/suppliers?showInactive=${showInactive}`);
      setSuppliers(data);
      toast.success('Supplier deleted successfully');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Failed to delete supplier');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Supplier</CardTitle>
              <CardDescription>Enter supplier details below</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter supplier name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate (per day)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter daily rate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-medium">Bank Details</h3>
                    <FormField
                      control={form.control}
                      name="bankDetails.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankDetails.ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IFSC code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankDetails.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Supplier'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Supplier List</CardTitle>
                  <CardDescription>View and manage suppliers</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      className="mr-2"
                    />
                    Show Inactive
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading suppliers...</div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : suppliers.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No suppliers found</div>
              ) : (
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{supplier.name}</h3>
                          {supplier.status === 'inactive' && (
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{supplier.email}</p>
                        <p className="text-sm">₹{supplier.rate}/day</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bank: {supplier.bankDetails.bankName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(supplier.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(supplier._id, supplier.status === 'active' ? 'inactive' : 'active')}
                          >
                            {supplier.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(supplier._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
