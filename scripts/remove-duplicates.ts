import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';
import { Invoice } from '@/types/models';

// Load environment variables
config({ path: '.env.local' });

async function removeDuplicateInvoices() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('notebook');
    const collection = db.collection<Invoice>('invoices');

    // Find all invoices
    const invoices = await collection.find({}).toArray();
    console.log(`Found ${invoices.length} total invoices`);

    // Group invoices by invoiceNumber
    const groupedInvoices = invoices.reduce((acc, invoice) => {
      const key = invoice.invoiceNumber;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(invoice);
      return acc;
    }, {} as Record<string, Invoice[]>);

    // Find duplicate groups
    const duplicateGroups = Object.entries(groupedInvoices)
      .filter(([_, group]) => group.length > 1);

    console.log(`Found ${duplicateGroups.length} groups of duplicates`);

    // Process each group of duplicates
    for (const [invoiceNumber, group] of duplicateGroups) {
      console.log(`Processing duplicates for invoice number: ${invoiceNumber}`);

      // Sort by createdAt date, newest first
      const sorted = group.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Keep the newest one, delete the rest
      const [latest, ...duplicates] = sorted;
      
      const duplicateIds = duplicates.map(d => d._id).filter((id): id is ObjectId => id !== undefined);

      if (duplicateIds.length > 0) {
        const result = await collection.deleteMany({
          _id: { $in: duplicateIds }
        });

        console.log(`Deleted ${result.deletedCount} duplicates for invoice number: ${invoiceNumber}`);
      }
    }

    console.log('Duplicate removal completed');
  } catch (error) {
    console.error('Error removing duplicates:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
removeDuplicateInvoices().catch(console.error);
