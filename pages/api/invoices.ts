import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { Invoice } from '@/types/models';
import { ObjectId } from 'mongodb';
import { getSession } from 'next-auth/react';

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
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const client = await clientPromise;
    const db = client.db("notebook");
    const collection = db.collection<Invoice>("invoices");

    switch (req.method) {
      case 'GET': {
        const { month, supplier } = req.query;
        const query: any = {};

        if (month) {
          const startOfMonth = new Date(month as string);
          const endOfMonth = new Date(startOfMonth);
          endOfMonth.setMonth(endOfMonth.getMonth() + 1);
          endOfMonth.setDate(0);

          query.invoiceDate = {
            $gte: startOfMonth.toISOString(),
            $lte: endOfMonth.toISOString()
          };
        }

        if (supplier) {
          query['supplier.name'] = supplier;
        }

        const invoices = await db.collection('invoices')
          .aggregate([
            { $match: query },
            {
              $lookup: {
                from: 'suppliers',
                localField: 'supplierId',
                foreignField: '_id',
                as: 'supplier'
              }
            },
            {
              $lookup: {
                from: 'clients',
                localField: 'clientId',
                foreignField: '_id',
                as: 'client'
              }
            },
            {
              $unwind: '$supplier'
            },
            {
              $unwind: '$client'
            },
            {
              $sort: { createdAt: -1 }
            }
          ])
          .toArray();

        return res.status(200).json({
          success: true,
          data: invoices
        });
      }

      case 'POST': {
        const newInvoice: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'> = {
          ...req.body,
          days: Number(req.body.days),
          amount: Number(req.body.amount)
        };

        const result = await collection.insertOne({
          ...newInvoice,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return res.status(201).json({
          success: true,
          data: { 
            _id: result.insertedId,
            ...newInvoice
          }
        });
      }

      case 'PUT': {
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'Invoice ID is required'
          });
        }

        const result = await collection.findOne(
          { _id: new ObjectId(id) }
        );

        if (!result) {
          return res.status(404).json({
            success: false,
            error: 'Invoice not found'
          });
        }

        const updateResult = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { 
            $set: {
              ...updateData,
              updatedAt: new Date()
            }
          },
          { returnDocument: 'after' }
        );

        if (!updateResult) {
          return res.status(404).json({
            success: false,
            error: 'Invoice not found'
          });
        }

        return res.status(200).json({
          success: true,
          data: updateResult
        });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Valid invoice ID is required'
          });
        }

        const result = await collection.deleteOne({
          _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            error: 'Invoice not found'
          });
        }

        return res.status(200).json({
          success: true,
          data: { id }
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Invoice API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
