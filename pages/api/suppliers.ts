import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { Supplier } from '@/types/models';

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Supplier>('suppliers');

    switch (req.method) {
      case 'GET': {
        if (req.query.id) {
          const supplier = await collection.findOne({
            _id: new ObjectId(req.query.id as string)
          });

          if (!supplier) {
            return res.status(404).json({
              success: false,
              error: 'Supplier not found'
            });
          }

          return res.status(200).json({
            success: true,
            data: supplier
          });
        }

        const suppliers = await collection.find({}).toArray();
        return res.status(200).json({
          success: true,
          data: suppliers
        });
      }

      case 'POST': {
        const newSupplier: Omit<Supplier, '_id' | 'createdAt' | 'updatedAt'> = {
          ...req.body,
          name: req.body.name.trim(),
          email: req.body.email.trim().toLowerCase(),
        };

        const result = await collection.insertOne({
          ...newSupplier,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const insertedSupplier = await collection.findOne({
          _id: result.insertedId
        });

        return res.status(201).json({
          success: true,
          data: insertedSupplier
        });
      }

      case 'PUT': {
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'Supplier ID is required'
          });
        }

        const result = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              ...updateData,
              updatedAt: new Date()
            }
          },
          { returnDocument: 'after' }
        );

        if (!result) {
          return res.status(404).json({
            success: false,
            error: 'Supplier not found'
          });
        }

        return res.status(200).json({
          success: true,
          data: result
        });
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'Supplier ID is required'
          });
        }

        const deleteResult = await collection.findOneAndDelete({
          _id: new ObjectId(id as string)
        });

        if (!deleteResult) {
          return res.status(404).json({
            success: false,
            error: 'Supplier not found'
          });
        }

        return res.status(200).json({
          success: true,
          data: { id }
        });
      }

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Suppliers API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
