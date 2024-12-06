const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Import types for TypeScript type checking only
import type { Supplier, Client } from '@/types/supplier';

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
console.log('Using MongoDB URI:', uri);

const suppliers: Omit<Supplier, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Joel",
    email: "joel@codeium.com",
    phone: "+1 234-567-8901",
    gstin: "29AADCB2230M1ZT",
    pan: "AADCB2230M",
    address: {
      street: "123 AI Street",
      city: "Mountain View",
      state: "California",
      pincode: "94043"
    },
    bankDetails: {
      accountName: "Joel",
      accountNumber: "123456789012",
      bankName: "Chase Bank",
      ifscCode: "CHASE001234",
      branch: "Mountain View"
    },
    rate: 2000
  },
  {
    name: "Shubhlika",
    email: "shubhlika@codeium.com",
    phone: "+1 234-567-8902",
    gstin: "29AADCB2230M2ZT",
    pan: "AADCB2230N",
    address: {
      street: "456 Tech Avenue",
      city: "Mountain View",
      state: "California",
      pincode: "94043"
    },
    bankDetails: {
      accountName: "Shubhlika",
      accountNumber: "123456789013",
      bankName: "Chase Bank",
      ifscCode: "CHASE001235",
      branch: "Mountain View"
    },
    rate: 2000
  },
  {
    name: "Ayushi",
    email: "ayushi@codeium.com",
    phone: "+1 234-567-8903",
    gstin: "29AADCB2230M3ZT",
    pan: "AADCB2230P",
    address: {
      street: "789 Innovation Drive",
      city: "Mountain View",
      state: "California",
      pincode: "94043"
    },
    bankDetails: {
      accountName: "Ayushi",
      accountNumber: "123456789014",
      bankName: "Chase Bank",
      ifscCode: "CHASE001236",
      branch: "Mountain View"
    },
    rate: 2000
  }
];

const clients: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Scorich",
    email: "billing@scorich.com",
    phone: "+1 234-567-8904",
    gstin: "29AABCU9603R1ZX",
    address: {
      street: "321 Business Park",
      city: "San Francisco",
      state: "California",
      pincode: "94105"
    }
  },
  {
    name: "YooMoney",
    email: "finance@yoomoney.com",
    phone: "+1 234-567-8905",
    gstin: "29AABCU9603R2ZX",
    address: {
      street: "654 Finance District",
      city: "San Francisco",
      state: "California",
      pincode: "94105"
    }
  }
];

async function seedDatabase() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(uri);
    console.log('Connected successfully to MongoDB');
    
    const db = client.db();
    console.log('Using database:', db.databaseName);

    // Clear existing data
    console.log('Clearing existing data...');
    const deleteSuppliers = await db.collection('suppliers').deleteMany({});
    console.log(`Deleted ${deleteSuppliers.deletedCount} suppliers`);
    const deleteClients = await db.collection('clients').deleteMany({});
    console.log(`Deleted ${deleteClients.deletedCount} clients`);

    // Insert new data with timestamps
    const now = new Date();
    const suppliersWithTimestamps = suppliers.map(supplier => ({
      ...supplier,
      createdAt: now,
      updatedAt: now
    }));
    const clientsWithTimestamps = clients.map(client => ({
      ...client,
      createdAt: now,
      updatedAt: now
    }));

    console.log('Inserting suppliers...');
    const supplierResult = await db.collection('suppliers').insertMany(suppliersWithTimestamps);
    console.log(`Inserted ${supplierResult.insertedCount} suppliers`);

    console.log('Inserting clients...');
    const clientResult = await db.collection('clients').insertMany(clientsWithTimestamps);
    console.log(`Inserted ${clientResult.insertedCount} clients`);

    // Verify the data
    const supplierCount = await db.collection('suppliers').countDocuments();
    const clientCount = await db.collection('clients').countDocuments();
    console.log(`Final count - Suppliers: ${supplierCount}, Clients: ${clientCount}`);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      console.log('Closing MongoDB connection...');
      await client.close();
      console.log('Connection closed');
    }
  }
}

seedDatabase();
