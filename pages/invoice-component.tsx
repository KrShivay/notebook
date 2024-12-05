import InvoiceComponent from '../components/InvoiceComponent';
import { useInvoice } from '../context/InvoiceContext';
import React from 'react';

const InvoiceComponentPage: React.FC = () => {
  const { invoiceData } = useInvoice();

  if (!invoiceData) {
    return <div>No invoice data found</div>;
  }

  // Parse numeric values
  const parsedInvoiceData = {
    ...invoiceData,
    days: Number(invoiceData?.days),
    amount: Number(invoiceData?.amount)
  };

  return (
    <div className="container mx-auto p-4">
      <InvoiceComponent data={parsedInvoiceData} />
    </div>
  );
};

export default InvoiceComponentPage;