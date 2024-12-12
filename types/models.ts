import { ObjectId } from 'mongodb';

export interface BaseDocument {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client extends BaseDocument {
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

export interface Supplier extends BaseDocument {
  name: string;
  email: string;
  rate: number;
  address?: string;
  phone?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export interface Invoice extends BaseDocument {
  invoiceNumber: string;
  clientId: ObjectId;
  supplierId: ObjectId;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  dueDate: Date;
  notes?: string;
}

export interface PopulatedInvoice extends Omit<Invoice, 'supplierId' | 'clientId'> {
  supplier: Supplier;
  client: Client;
}

export interface SessionData extends BaseDocument {
  sessionId: string;
  email: string;
  expiresAt: Date;
  clientInfo?: {
    userAgent?: string;
    ip?: string | string[];
  };
}
