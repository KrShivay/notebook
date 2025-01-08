import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Client } from '@/types/supplier';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('clients');

    switch (req.method) {
      case 'GET':
        // Only return active clients by default
        const { showInactive } = req.query;
        const query = showInactive === 'true' ? {} : { status: { $ne: 'inactive' } };
        const clients = await collection.find(query).toArray();
        return res.status(200).json(clients);

      case 'POST':
        const newClient = {
          ...req.body,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(newClient);
        return res.status(201).json({ ...newClient, _id: result.insertedId });

      case 'PUT':
        const { _id, ...updateData } = req.body;
        const updatedClient = await collection.findOneAndUpdate(
          { _id: new ObjectId(_id) },
          { 
            $set: { 
              ...updateData,
              updatedAt: new Date()
            } 
          },
          { returnDocument: 'after' }
        );
        return res.status(200).json(updatedClient);

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
        return res.status(200).json({ message: 'Client deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in client API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
