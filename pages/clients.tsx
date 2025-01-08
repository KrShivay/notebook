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

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Client extends ClientFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      phone: '',
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await fetchWithErrorHandling<Client[]>(`/api/clients?showInactive=${showInactive}`);
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [showInactive]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      const response = await fetchWithErrorHandling<Client>('/api/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      toast.success('Client added successfully!');
      form.reset();
      
      // Refresh clients list
      const updatedClients = await fetchWithErrorHandling<Client[]>(`/api/clients?showInactive=${showInactive}`);
      setClients(updatedClients);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      await fetchWithErrorHandling('/api/clients', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      // Refresh the list
      const data = await fetchWithErrorHandling<Client[]>(`/api/clients?showInactive=${showInactive}`);
      setClients(data);
      toast.success(`Client marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Failed to update client status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await fetchWithErrorHandling(`/api/clients?id=${id}`, {
        method: 'DELETE',
      });
      
      // Refresh the list
      const data = await fetchWithErrorHandling<Client[]>(`/api/clients?showInactive=${showInactive}`);
      setClients(data);
      toast.success('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Client</CardTitle>
              <CardDescription>Enter client details below</CardDescription>
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
                          <Input placeholder="Enter client name" {...field} />
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Client'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Client List</CardTitle>
                  <CardDescription>View and manage clients</CardDescription>
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
                <div className="text-center py-4">Loading clients...</div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : clients.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No clients found</div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div
                      key={client._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{client.name}</h3>
                          {client.status === 'inactive' && (
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(client._id, client.status === 'active' ? 'inactive' : 'active')}
                          >
                            {client.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(client._id)}
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
