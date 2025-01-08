import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcryptjs';
import { AuthResponse } from '@/types/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { email, password, clientInfo } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const { db } = await connectToDatabase().catch((error) => {
      console.error('Database connection error:', error);
      throw new Error('Database connection failed');
    });

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Create session
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const session = {
      sessionId,
      userId: user._id,
      email: user.email,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clientInfo: {
        ...clientInfo,
        timestamp: now.toISOString(),
      },
    };

    await db.collection('sessions').insertOne(session).catch((error) => {
      console.error('Session creation error:', error);
      throw new Error('Failed to create session');
    });

    // Remove sensitive data from session
    const { userId, ...sessionData } = session;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      sessionData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
}
