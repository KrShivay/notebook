import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';
import { Invoice, Supplier } from '@/types/models';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongodb URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Define the type for supplier rates
type SupplierRates = {
  [key: string]: number;
};

// Updated rates
const supplierRates: SupplierRates = {
  'Joel': 8686,
  'Shubhlika': 7445,
  'Neetu': 6204,
};

function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertToWords(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertToWords(num % 100) : '');
    if (num < 100000) return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertToWords(num % 1000) : '');
    return convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertToWords(num % 100000) : '');
  }
  
  return convertToWords(amount) + ' Rupees';
}

async function updateRatesAndInvoices() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('notebook');
    const invoicesCollection = db.collection<Invoice>('invoices');
    const suppliersCollection = db.collection<Supplier>('suppliers');

    // First update all supplier rates in the suppliers collection
    for (const [supplierName, rate] of Object.entries(supplierRates)) {
      console.log(`Updating rate for ${supplierName} to ${rate}`);
      await suppliersCollection.updateMany(
        { name: supplierName },
        { $set: { rate: rate } }
      );
    }

    // Get all invoices
    const invoices = await invoicesCollection.find({}).toArray();
    console.log(`Found ${invoices.length} invoices to update`);

    // Update each invoice
    for (const invoice of invoices) {
      const supplierName = invoice.supplier.name;
      const newRate = supplierRates[supplierName];
      
      if (newRate) {
        // Calculate new amount based on days and new rate
        const newAmount = invoice.days * newRate;
        const amountInWords = `₹${numberToWords(newAmount)} only`;

        console.log(`Updating invoice ${invoice.invoiceNumber}:`);
        console.log(`- Old amount: ${invoice.amount}`);
        console.log(`- New amount: ${newAmount}`);
        console.log(`- Days: ${invoice.days}`);
        console.log(`- New rate: ${newRate}`);

        // Update both the supplier rate within the invoice and the invoice amount
        await invoicesCollection.updateOne(
          { _id: invoice._id },
          {
            $set: {
              'supplier.rate': newRate,
              amount: newAmount,
              amountInWords: amountInWords
            }
          }
        );
      } else {
        console.log(`Warning: No rate found for supplier ${supplierName}`);
      }
    }

    console.log('Update completed successfully!');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.close();
  }
}

async function updateSupplierRates() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('notebook');
    const invoicesCollection = db.collection<Invoice>('invoices');
    const suppliersCollection = db.collection<Supplier>('suppliers');

    // Get all suppliers
    const suppliers = await suppliersCollection.find({}).toArray();
    console.log(`Found ${suppliers.length} suppliers`);

    // Process each supplier
    for (const supplier of suppliers) {
      console.log(`Processing supplier: ${supplier.name}`);

      // Get all invoices for this supplier
      const invoices = await invoicesCollection
        .find({ supplierId: supplier._id })
        .toArray();

      if (invoices.length === 0) {
        console.log(`No invoices found for supplier: ${supplier.name}`);
        continue;
      }

      // Calculate average rate
      const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const averageAmount = totalAmount / invoices.length;

      // Update supplier with new rate
      const result = await suppliersCollection.updateOne(
        { _id: supplier._id },
        {
          $set: {
            averageRate: averageAmount,
            updatedAt: new Date()
          }
        }
      );

      console.log(`Updated supplier ${supplier.name}: ${result.modifiedCount} document modified`);
    }

    console.log('Rate update completed');
  } catch (error) {
    console.error('Error updating rates:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateRatesAndInvoices();
updateSupplierRates().catch(console.error);
