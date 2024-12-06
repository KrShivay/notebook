export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
}

export interface Supplier {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  address: Address;
  bankDetails: BankDetails;
  rate: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  address: Address;
  createdAt?: Date;
  updatedAt?: Date;
}
