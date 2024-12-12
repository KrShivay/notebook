import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { Client } from '@/types/models';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("notebook");
    const collection = db.collection<Client>("clients");

    switch (req.method) {
      case 'GET':
        const clients = await collection.find({}).toArray();
        return res.status(200).json(clients);

      case 'POST':
        const newClient: Omit<Client, '_id'> = {
          ...req.body,
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

      case 'DELETE':
        const { id } = req.query;
        await collection.deleteOne({ _id: new ObjectId(id as string) });
        return res.status(200).json({ message: 'Client deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in client API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
