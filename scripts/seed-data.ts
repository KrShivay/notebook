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
    email: "j18320775@gmail.com",
    phone: "+1 234-567-8901",
    gstin: "",
    pan: "BWEPJ8564R",
    address: {
      street: "Teachers colony,",
      city: "Basil Nagar",
      state: "Khirighat Basti",
      pincode: "272002"
    },
    bankDetails: {
      accountName: "Joel James",
      accountNumber: "6713446142",
      bankName: "Kotak Mahindra Bank",
      ifscCode: "KKBK0005199",
      branch: "Basti"
    },
    rate: 8686
  },
  {
    name: "Shubhlika",
    email: "shubhlika119@gmail.com",
    phone: "+1 234-567-8902",
    gstin: "",
    pan: "IWBPS2322Q",
    address: {
      street: "456 Tech Avenue",
      city: "Mountain View",
      state: "California",
      pincode: "94043"
    },
    bankDetails: {
      accountName: "Shubhlika Srivastava",
      accountNumber: "1854000101066224",
      bankName: "Punjab National Bank",
      ifscCode: "PUNB0185400",
      branch: "Lucknow"
    },
    rate: 7445
  },
  {
    name: "Ayushi",
    email: "neetu429.b@gmail.com",
    phone: "+1 234-567-8903",
    gstin: "",
    pan: "AADCB2230P",
    address: {
      street: "F-27 mahendra enclave",
      city: "Shastri Nagar",
      state: "Ghaziabad",
      pincode: "201002"
    },
    bankDetails: {
      accountName: "Neetu Balyan",
      accountNumber: "35855347145",
      bankName: "State Bank of India",
      ifscCode: "SBIN0051016",
      branch: "Ghaziabad"
    },
    rate: 6204
  }
];

const clients: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "SCORICH",
    email: "billing@scorich.com",
    phone: "+1 234-567-8904",
    gstin: "06ABCCS0514K1ZK",
    address: {
      street: "SERVICES PVT . LTD.",
      city: "Orchid Centre,2nd Floor, Golf Course Road",
      state: "Sector-53, Gurgaon, Haryana, India",
      pincode: ""
    }
  },
  {
    name: "YOOMONEY",
    email: "billing@yoomoney.com",
    phone: "+1 234-567-8905",
    gstin: "",
    address: {
      street: "FINTECH SERVICES PRIVATE LIMITED",
      city: "SHOP NO 213 SUNCITY , ARCADE SEC-54, ",
      state: "Gurgaon- 122002, Haryana",
      pincode: ""
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
