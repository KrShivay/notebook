import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier, Client } from '@/types/supplier';
import { fetchWithErrorHandling } from '@/utils/api-error';

interface DataContextType {
  suppliers: Supplier[];
  clients: Client[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Supplier>;
  updateSupplier: (supplier: Supplier) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (client: Client) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [suppliersData, clientsData] = await Promise.all([
        fetchWithErrorHandling<Supplier[]>('/api/suppliers'),
        fetchWithErrorHandling<Client[]>('/api/clients')
      ]);
      setSuppliers(suppliersData);
      setClients(clientsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addSupplier = async (supplier: Omit<Supplier, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetchWithErrorHandling<Supplier>('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier)
    });
    await refreshData();
    return response;
  };

  const updateSupplier = async (supplier: Supplier) => {
    const response = await fetchWithErrorHandling<Supplier>('/api/suppliers', {
      method: 'PUT',
      body: JSON.stringify(supplier)
    });
    await refreshData();
    return response;
  };

  const deleteSupplier = async (id: string) => {
    await fetchWithErrorHandling(`/api/suppliers?id=${id}`, {
      method: 'DELETE'
    });
    await refreshData();
  };

  const addClient = async (client: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetchWithErrorHandling<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(client)
    });
    await refreshData();
    return response;
  };

  const updateClient = async (client: Client) => {
    const response = await fetchWithErrorHandling<Client>('/api/clients', {
      method: 'PUT',
      body: JSON.stringify(client)
    });
    await refreshData();
    return response;
  };

  const deleteClient = async (id: string) => {
    await fetchWithErrorHandling(`/api/clients?id=${id}`, {
      method: 'DELETE'
    });
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        suppliers,
        clients,
        loading,
        error,
        refreshData,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addClient,
        updateClient,
        deleteClient
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
