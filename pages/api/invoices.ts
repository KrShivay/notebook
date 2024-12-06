import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    const client = await clientPromise;
    const db = client.db('notebook');
    const collection = db.collection('invoices');

    if (method === 'GET') {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Valid email is required' });
      }

      // Query using both email fields to handle existing data
      const invoices = await collection
        .find({
          $or: [
            { email: email },
            { userEmail: email }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`Found ${invoices.length} invoices for email: ${email}`);
      return res.status(200).json(invoices);
    }

    if (method === 'POST') {
      const invoiceData = req.body;
      
      // Validate user email
      if (!invoiceData.userEmail) {
        return res.status(401).json({ message: 'User email is required' });
      }

      // Store both email fields for backward compatibility
      const result = await collection.insertOne({
        ...invoiceData,
        email: invoiceData.userEmail,
        userEmail: invoiceData.userEmail,
        createdAt: new Date(),
      });

      return res.status(201).json({ 
        message: 'Invoice saved successfully', 
        id: result.insertedId,
        email: invoiceData.userEmail 
      });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${method} not allowed` });
  } catch (error) {
    console.error('Error processing invoice request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
