import React, { createContext, useContext, useState } from 'react';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  startDate: string;
  endDate: string;
  days: number;
  amount: number;
  amountInWords: string;
  supplier: any;
  client: any;
}

interface InvoiceContextType {
  invoiceData: InvoiceData | null;
  setInvoiceData: (data: InvoiceData) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  return (
    <InvoiceContext.Provider value={{ invoiceData, setInvoiceData }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}
