import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Supplier } from '@/types/supplier';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('suppliers');

    switch (req.method) {
      case 'GET':
        // Only return active suppliers by default
        const { showInactive } = req.query;
        const query = showInactive === 'true' ? {} : { status: { $ne: 'inactive' } };
        const suppliers = await collection.find(query).toArray();
        return res.status(200).json(suppliers);

      case 'POST':
        const newSupplier = {
          ...req.body,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(newSupplier);
        return res.status(201).json({ ...newSupplier, _id: result.insertedId });

      case 'PUT':
        const { _id, ...updateData } = req.body;
        const updatedSupplier = await collection.findOneAndUpdate(
          { _id: new ObjectId(_id) },
          { 
            $set: { 
              ...updateData,
              updatedAt: new Date()
            } 
          },
          { returnDocument: 'after' }
        );
        return res.status(200).json(updatedSupplier);

      case 'PATCH':
        // For updating status only
        const { id, status } = req.body;
        const statusResult = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              status,
              updatedAt: new Date()
            } 
          },
          { returnDocument: 'after' }
        );
        return res.status(200).json(statusResult);

      case 'DELETE':
        const { id: deleteId } = req.query;
        await collection.deleteOne({ _id: new ObjectId(deleteId as string) });
        return res.status(200).json({ message: 'Supplier deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in supplier API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
